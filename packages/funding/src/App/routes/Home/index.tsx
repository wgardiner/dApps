import { PageLayout, YourAccount } from '@cosmicdapp/design';
import { useError, useSdk } from '@cosmicdapp/logic';
import { Contract } from '@cosmjs/cosmwasm';
import { Button, Typography, Card, Modal, List } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { pathContract } from '../../paths';
import {
	ContractStack,
	MainStack,
	ContractList,
	Caption,
	Heading,
	NormalLink,
} from './style';

const { Title } = Typography;

// reference for init message
// export interface MsgInstantiateContract extends Msg {
//   readonly type: "wasm/MsgInstantiateContract";
//   readonly value: {
//     /** Bech32 account address */
//     readonly sender: string;
//     /** ID of the Wasm code that was uploaded before */
//     readonly code_id: string;
//     /** Human-readable label for this contract */
//     readonly label: string;
//     /** Init message as JavaScript object */
//     readonly init_msg: any;
//     readonly init_funds: readonly Coin[];
//     /** Bech32-encoded admin address */
//     readonly admin?: string;
//   };
// }
// export interface InstantiateOptions {
//   readonly memo?: string;
//   readonly transferAmount?: readonly Coin[];
//   /**
//    * A bech32 encoded address of an admin account.
//    * Caution: an admin has the privilege to upgrade a contract. If this is not desired, do not set this value.
//    */
//   readonly admin?: string;
// }

// reference for our initmsg
// pub struct InitMsg {
//     // pub count: i32,
//     // Coins for funding pool are attached to TX
//     pub name: String,
//     pub proposer_whitelist: Vec<HumanAddr>,
//     pub voter_whitelist: Vec<HumanAddr>,
//     // pub proposal_min_period: Option<u32>,
//     // pub voting_min_period: Option<u32>,
//     pub proposal_period_start: Option<u64>,
//     pub proposal_period_end: Option<u64>,
//     pub voting_period_start: OptioWidthListn<u64>,
//     pub voting_period_end: Option<u64>,
//     // pub funding_formula: Option<String>,
// }

export function Home(): JSX.Element {
	const { setError } = useError();
	const { getClient } = useSdk();

	const [contracts, setContracts] = useState<readonly Contract[]>([]);

	async function getInstantiationsList() {
		getClient()
			.getContracts(config.codeId)
			.then((contracts) => setContracts(contracts))
			.catch(setError);
	}

	useEffect(() => {
		getInstantiationsList();
	}, [getClient, setError]);

	async function onCreateInstantiation() {
		const rand = Math.floor(Math.random() * 1e6);
		const initMsg = {
			name: `My Funding Round ${rand}`,
			proposer_whitelist: [],
			voter_whitelist: [],
			proposal_period_start: Math.floor(Date.now() / 1e3),
			proposal_period_end:
				Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 31 * 12,
			voting_period_start: Math.floor(Date.now() / 1e3),
			voting_period_end: Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 31 * 12,
		};
		const initOptions = {
			memo: 'memo',
			transferAmount: [{ denom: 'ushell', amount: '10000' }],
		};
		// TODO: make this into a form
		// TODO: show spinner while loading
		try {
			const res = await getClient().instantiate(
				139,
				initMsg,
				`Funding ${rand}`,
				initOptions
			);
			// TODO: show success message
			// setContracts([...contracts, ])
			getInstantiationsList();
		} catch (err) {
			setError(err);
		}
	}

	return (
		<PageLayout>
			<MainStack>
				<Title>Funding</Title>
				<Card>
					<ContractStack tag="nav">
						<ContractList>
							{contracts.map(({ label, address }) => (
								<List.Item
								// actions={[
								//   <Link to={`${pathContract}/${label.toLowerCase()}/${address}`}>
								//     {/* <Link key={address} to={`${pathContract}/${address}`}> */}
								//     <Button block={false}>
								//       View Proposals
								//     </Button>
								//   </Link>
								// ]}
								>
									<NormalLink
										to={`${pathContract}/${label.toLowerCase()}/${address}`}
									>
										<Heading>{label}</Heading>
										<Caption>{address}</Caption>
										{/* <List.Item.Meta title={label} description={address} /> */}
									</NormalLink>
								</List.Item>
							))}
						</ContractList>
					</ContractStack>
				</Card>
				<ContractStack>
					<Button type="primary" onClick={onCreateInstantiation}>
						New Instantiation
					</Button>
				</ContractStack>
				<YourAccount tag="footer" />
			</MainStack>
			{/* <Modal visible={true}>asdfasdf</Modal> */}
		</PageLayout>
	);
}
