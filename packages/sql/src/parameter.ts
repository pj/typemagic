export class Parameter<Type> {
  constructor (public position: number | null ) {}
}

// export const parameter = new Parameter(null);

export function param<Type = unknown>(position: number | null) {
  return new Parameter<Type>(position);
}