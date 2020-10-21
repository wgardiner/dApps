// export { CenterProps } from "./component";
export interface CenterProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  readonly tag?: keyof JSX.IntrinsicElements;
}
export { StyledCenter as Center } from "./style";
