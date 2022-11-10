import type { EventHint, Event } from '@sentry/remix';
import type { Context } from '@sentry/types';
import * as Sentry from '@sentry/remix';

const isServer = typeof window === 'undefined';

export const beforeSend = (
  event: Event,
  hint: EventHint
): PromiseLike<Event | null> | Event | null => {
  const error = hint.originalException;

  return {
    ...event,
    extra: {
      ...event.extra,
      'Error-Full-Object': error,
    },
  };
};

export function captureException(error: unknown, context: Context = {}) {
  let rv: string | undefined;
  if (error === null) return rv;

  Sentry.withScope((scope) => {
    scope.setExtra('Error-Context', { ...context, server: isServer });

    rv = Sentry.captureException(error, {
      contexts: {
        Error: context,
      },
    });
  });

  return rv;
}