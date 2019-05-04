// Type definitions for styled-theming 2.2
// Project: https://github.com/styled-components/styled-theming#readme
// Definitions by: Arjan Jassal <https://github.com/ArjanJ>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.7

import { FlattenSimpleInterpolation } from 'styled-components';

declare function styledTheme(name: string, values: styledTheme.ThemeMap): styledTheme.ThemeSet;

declare namespace styledTheme {
  type ThemeValueFn = (props: object) => string;
  type ThemeValue = string | ThemeValueFn | FlattenSimpleInterpolation;

  interface ThemeMap {
    [key: string]: ThemeValue;
  }

  interface VariantMap {
    [key: string]: ThemeMap;
  }

  type ThemeSet = (props: object) => string;
  type VariantSet = (props: object) => string;

  function variants(
    name: string,
    prop: string,
    values: VariantMap
  ): VariantSet;
}

export default styledTheme;
