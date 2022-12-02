import type { EventHint, Event } from '@sentry/remix';
import type { Context } from '@sentry/types';
import * as Sentry from '@sentry/remix';
import type * as express from 'express';
import { getClientIPAddress } from 'remix-utils';

const isServer = typeof window === 'undefined';

export function createRemixHeaders(
  requestHeaders: express.Request['headers']
): Headers {
  const headers = new Headers();

  for (const [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  return headers;
}

export const beforeSend = (
  event: Event,
  hint: EventHint
): PromiseLike<Event | null> | Event | null => {
  const error = hint.originalException;

  return {
    ...event,
    extra: {
      ...event.extra,
      'remix-utils.getClientIPAddress': event.request?.headers ? getClientIPAddress(createRemixHeaders(event.request.headers)) : undefined,
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