import { Stack } from "@cosmicdapp/design";
import { List, Typography, Link } from 'antd';
import styled from "styled-components";

export const MainStack = styled(Stack)`
  h1 {
    margin: 0;
    text-transform: capitalize;
  }

  span {
    /* font-size: var(--s-1); */
    /* overflow-wrap: anywhere; */
  }
`;

export const ContractStack = styled(Stack)`
  & > * {
    --gap: var(--s2);
  }
`;

export const ContractList = styled(List)`
  width: var(--max-width);
  text-align: left;

  .ant-list-item-meta-description {
    font-size: 12px;
  }
`

export const NormalLink = styled(Link)`
  line-height: 1;
`;

export const Heading = styled.div`
  font-size: var(--s1);
`;

export const Caption = styled(Typography.Text)`
  font-weight: lighter;
  font-size: var(--s-2);
`
