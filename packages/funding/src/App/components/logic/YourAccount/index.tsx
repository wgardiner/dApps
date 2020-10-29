import { printableBalance, useAccount } from '@cosmicdapp/logic';
import { Button, Divider, Typography, Space } from 'antd';
import copyToClipboard from 'clipboard-copy';
import React from 'react';
import { StackProps } from '../../layout/Stack';
import { AccountStack } from './style';
import { CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface YourAccountProps extends StackProps {
	readonly hideTitle?: boolean;
	readonly hideBalance?: boolean;
}

export function YourAccount({
	tag,
	hideTitle,
	hideBalance,
}: YourAccountProps): JSX.Element {
	const accountProvider = useAccount();
	const { address, balance } = accountProvider.account ?? {
		address: '',
		balance: [],
	};

	return (
		<AccountStack tag={tag}>
			{!hideTitle && (
				<header>
					<Title level={3}>Your Account</Title>
					{!hideBalance && <Divider />}
				</header>
			)}
			<Space>
				<Text style={{ fontSize: '12px' }}>{address}</Text>
				<Button
					onClick={() => copyToClipboard(address)}
					type="text"
					icon={<CopyOutlined />}
				/>
			</Space>
			{!hideBalance && <Text>({printableBalance(balance)})</Text>}
		</AccountStack>
	);
}
