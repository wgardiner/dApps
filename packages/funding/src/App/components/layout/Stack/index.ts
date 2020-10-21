export { StyledStack as Stack } from "./style";

export interface StackProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  readonly tag?: keyof JSX.IntrinsicElements;
}
// export { StackProps } from "./component";
