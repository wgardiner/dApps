import { Stack } from '../../components/layout/Stack';
import { List, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const MainStack = styled(Stack)`
	--gap: var(--s4);
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
	li + li {
		/* --gap: var(--s1); */
		margin-top: var(--s0);
		/* margin-bottom: var(--s1); */
	}
`;

export const ContractList = styled(List)`
	/* max-width: var(--max-width); */
	text-align: left;

	& > * {
		--gap: var(--s1);
	}

	.ant-list-item-meta-description {
		font-size: 12px;
	}
`;

export const NormalLink = styled(Link)`
	line-height: 1;
`;

export const Heading = styled.div`
	font-size: var(--s1);
`;

export const Caption = styled(Typography.Text)`
	font-weight: lighter;
	font-size: var(--s-2);
`;
