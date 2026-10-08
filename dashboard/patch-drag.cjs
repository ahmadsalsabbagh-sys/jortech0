const fs = require('fs');

let layout = fs.readFileSync('dashboard/src/components/Layout.tsx', 'utf8');

// We need to inject the drag logic into Layout.tsx
// Find where state is declared:
const stateInsert = `
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
`;
layout = layout.replace(/const \[fabPos, setFabPos\] = useState\(\(\) => localStorage.getItem\('fab_pos'\) \|\| 'br'\);/g, 
  "const [fabPos, setFabPos] = useState(() => localStorage.getItem('fab_pos') || 'br');\n  const [isDragging, setIsDragging] = useState(false);\n  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });\n  const [rawPos, setRawPos] = useState<{x: number, y: number} | null>(null);\n");

const effectInsert = `
  useEffect(() => {
    if (!isDragging) return;
    
    const onMove = (e: PointerEvent) => {
      setRawPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };
    
    const onUp = (e: PointerEvent) => {
      setIsDragging(false);
      setRawPos(null);
      
      // Calculate nearest corner to snap to
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const finalX = e.clientX;
      const finalY = e.clientY;
      
      let newPos = 'br';
      if (finalY < centerY) {
        newPos = finalX < centerX ? 'tl' : 'tr';
      } else {
        newPos = finalX < centerX ? 'bl' : 'br';
      }
      setFabPos(newPos);
    };
    
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging, dragOffset]);

  const onFabPointerDown = (e: React.PointerEvent) => {
    // Only drag on left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
`;

layout = layout.replace(/useEffect\(\(\) => \{\n    localStorage.setItem\('fab_opacity'/g, effectInsert + "\n  useEffect(() => {\n    localStorage.setItem('fab_opacity'");

// Update getContainerStyle to use rawPos if dragging
const containerStyleUpdate = `const getContainerStyle = () => {
    let style: any = { zIndex: 100, position: 'fixed', touchAction: 'none' };
    
    if (rawPos) {
      style.left = rawPos.x + 'px';
      style.top = rawPos.y + 'px';
      style.right = 'auto';
      style.bottom = 'auto';
      style.transition = 'none'; // smooth dragging
      return style;
    }
    style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
`;
layout = layout.replace(/const getContainerStyle = \(\) => \{\n    const isMobile = window.innerWidth <= 768;/g, containerStyleUpdate + '\n    const isMobile = window.innerWidth <= 768;');

// Prevent menu opening if it was a drag
layout = layout.replace(/onClick=\{\(\) => setIsMenuOpen\(!isMenuOpen\)\}/g, 
  "onClick={(e) => { if (isDragging) e.preventDefault(); else setIsMenuOpen(!isMenuOpen); }}\n          onPointerDown={onFabPointerDown}");

fs.writeFileSync('dashboard/src/components/Layout.tsx', layout, 'utf8');

// 2. Fix CSS to make the icon scale proportionally and fix menu cutoff
let css = fs.readFileSync('dashboard/src/components/Layout.css', 'utf8');

// Replace fixed icon sizes with proportional sizes
css = css.replace(/\.fab-icon-svg \{\s*transition: all 0\.4s cubic-bezier\(0\.4, 0, 0\.2, 1\);\s*\}/, 
`.fab-icon-svg {
  width: 45% !important;
  height: 45% !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}`);

// Ensure top menu has some margin so it doesn't get cut off on the right by scrollbars
css = css.replace(/\.floating-menu\.menu-top \{\s*bottom: auto;\s*top: 100%;\s*margin-top: 20px;\s*transform-origin: top right;\s*\}/, 
`.floating-menu.menu-top {
  bottom: auto;
  top: 100%;
  margin-top: 20px;
  transform-origin: top right;
  margin-right: 10px; /* buffer for scrollbar */
}`);
// Also for menu-left
css += `\n.floating-menu.menu-left { margin-left: 10px; }\n`;

fs.writeFileSync('dashboard/src/components/Layout.css', css, 'utf8');
console.log('Drag and scale logic added');