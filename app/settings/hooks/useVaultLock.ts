"use client";

import { useState } from "react";

type Props = {
  verifyVaultPin: (
    pin: string
  ) => Promise<boolean>;
};

export default function useVaultLock({
  verifyVaultPin,
}: Props) {

  const [locked, setLocked] =
    useState(true);

  const [pin, setPin] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [attempts, setAttempts] =
    useState(0);

  const [blockedUntil, setBlockedUntil] =
    useState<number | null>(null);

  async function unlock() {

    if (loading) return;

    if (
      blockedUntil &&
      Date.now() < blockedUntil
    ) {

      setError(
        "Too many wrong attempts. Try again in 30 seconds."
      );

      return;

    }

    setLoading(true);

    setError("");

    try {

      const ok =
        await verifyVaultPin(pin);

      if (ok) {

        setLocked(false);

        setAttempts(0);

        setPin("");

        return;

      }

      const next =
        attempts + 1;

      setAttempts(next);

      if (next >= 3) {

        setBlockedUntil(
          Date.now() + 30000
        );

        setAttempts(0);

        setError(
          "Vault locked for 30 seconds."
        );

      } else {

        setError(
          `Incorrect PIN. ${
            3 - next
          } attempts left.`
        );

      }

    } catch {

      setError(
        "Unable to verify PIN."
      );

    } finally {

      setLoading(false);

    }

  }

  return {

    locked,

    pin,
    setPin,

    loading,

    error,

    unlock,

  };

}