import { tryOr } from "@tsly/core";

/**
 * A shorthand type for `T | null`.
 */
export type Nullable<T> = T | null;

export function isNone<T>(m: Nullable<T>): m is null {
  return m == null;
}

export function isSome<T>(m: Nullable<T>): m is NonNullable<T> {
  return m != null;
}

// ## //

type CoalescableMaybe<T> =
  | Maybe<NonNullable<T>>
  | (T extends T ? (T extends null | undefined ? null : never) : never);

export function maybe<T>(inner: T): CoalescableMaybe<T> {
  if (inner == null) return null as CoalescableMaybe<T>;
  else return new Maybe(inner) as CoalescableMaybe<T>;
}

class Maybe<T> {
  constructor(private inner: T) {}

  let<E>(mapping: (it: T) => E): CoalescableMaybe<E> {
    return maybe(mapping(this.inner));
  }

  takeIf(predicate: (it: T) => boolean): T | null {
    if (predicate(this.inner)) return this.inner;
    else return null;
  }

  takeUnless(predicate: (it: T) => boolean): T | null {
    if (predicate(this.inner)) return null;
    else return this.inner;
  }

  if(predicate: (it: T) => boolean): Maybe<T> | null {
    if (predicate(this.inner)) return this;
    else return null;
  }

  unless(predicate: (it: T) => boolean): Maybe<T> | null {
    if (predicate(this.inner)) return null;
    else return this;
  }

  try<E>(mapping: (it: T) => E): CoalescableMaybe<E> | null {
    return tryOr(() => this.let(mapping), null);
  }

  tryTake<E>(mapping: (it: T) => E): E | null {
    return this.try(mapping)?.take() ?? null;
  }

  also(fn: (it: T) => unknown): Maybe<T> {
    fn(this.inner);
    return this;
  }

  take<E>(mapping: (it: T) => E): E;
  take(): T;

  take<E = T>(mapping?: (it: T) => E): T | E {
    return typeof mapping == "function" ? mapping(this.inner) : this.inner;
  }
}
