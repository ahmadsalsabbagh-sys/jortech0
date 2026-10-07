package com.rmyndharis.openwa.model;

/**
 * A contact known to a session. Optional fields are {@code null} when absent.
 *
 * <p>{@code isBlocked} reflects the account's real blocklist on both engines. When the blocklist
 * query fails the field stays at its default rather than reporting "nobody is blocked", and the
 * gateway logs a warning — so a false is not proof the contact is unblocked if the link is
 * unhealthy.
 */
public record ContactRecord(
    String id,
    String name,
    String number,
    String pushName,
    Boolean isMyContact,
    Boolean isBlocked,
    String profilePicUrl) {}
