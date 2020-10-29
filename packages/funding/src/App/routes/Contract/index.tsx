import { FormCreateProposal } from './components/FormCreateProposal';
import { BackButton, Loading, PageLayout } from '@cosmicdapp/design';
import { YourAccount } from '../../components/logic/YourAccount';
import { Button, Typography, Input, InputNumber, Card, notification, Space, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import backArrowIcon from '../../assets/backArrow.svg';
import { pathHome } from '../../paths';
import { Link } from 'react-router-dom';
// import { FormSearchName } from "./components/FormSearchName";
// import { SearchResult } from "./components/SearchResult";
import { BackSearchResultStack, MainStack, SearchStack } from './style';
import { pathContract } from '../../paths';

import {
	/*getErrorFromStackTrace, printableCoin, useAccount,*/ useError,
	useSdk,
} from '@cosmicdapp/logic';
// import { string } from "yup";

const { Title, Text } = Typography;

interface ContractParams {
	readonly label: string;
	readonly address: string;
	readonly name?: string;
}

// For Reference
// queryContractSmart: async (address: string, query: Record<string, unknown>) => {
//   const encoded = toHex(toUtf8(JSON.stringify(query)));
//   const path = `/wasm/contract/${address}/smart/${encoded}?encoding=hex`;
//   const responseData = (await base.get(path)) as WasmResponse<SmartQueryResponse>;
//   const result = unwrapWasmResponse(responseData);
//   // By convention, smart queries must return a valid JSON document (see https://github.com/CosmWasm/cosmwasm/issues/144)
//   return JSON.parse(fromUtf8(fromBase64(result.smart)));
// },

export function Contract(): JSX.Element {
	const { label, address, name } = useParams() as ContractParams;

	const [loading, setLoading] = useState(false);
	// const [searchedName, setSearchedName] = useState(name);

	// function setLowercaseSearchedName(newName: string) {
	// 	setSearchedName(newName.toLowerCase());
	// }

	interface Proposal {
		readonly [key: string]: any;
	}
	const [proposals, setProposals] = useState<readonly Proposal[]>([]);
	const { setError, error } = useError();
	const { getClient } = useSdk();

	function getProposals() {
		getClient()
			// .queryContractSmart(address, { resolve_record: { name } })
			// one of`get_state`, `proposal_list`, `proposal_state`
			.queryContractSmart(address, { proposal_list: {} })
			.then((response) => {
				// setNameOwnerAddress(response.address);
				console.log(response);
				setProposals(response.proposals);
			})
			.catch((error) => {
				// // a not found error means it is free, other errors need to be reported
				// if (!error.toString().includes("NameRecord not found")) {
				//   setError(error);
				// }
				console.warn(error);
			});
	}

	useEffect(() => {
		// console.log('useeffect');
		// console.log(address);
		// (window as any).getClient = getClient;
		// (window as any).address = address;
		// console.log(label, name, address);
		getProposals();
	}, [setError, address, getClient, name]);

	const [votesInputState, setVotesInputState] = useState<{
		[key: number]: any;
	}>({});
	const [isLoading, setIsLoading] = useState<number | null>(null);
	const onVoteCreate = (id: number) => async (ev) => {
		// console.log(ev);
		// console.log(ev.target.value);
		const amount = votesInputState[id];
		const handleMsg = {
			create_vote: {
				proposal_id: id,
			},
		};
		console.log('create vote', id, amount);
		// console.log(`execute('create_vote', { proposal: ${id}, amount: [{amount: ${amount}}]})`);
		try {
			setIsLoading(id);
			const res = await getClient().execute(address, handleMsg, 'create vote', [
				{ denom: 'ushell', amount: String(amount) },
			]);

			// getClient.execute()
			console.log(res);
			// getProposals();
      const { [id]: _, ...rest } = votesInputState;
      console.log('-------', id, _, rest, votesInputState);
			setVotesInputState({ ...rest });
			notification.success({
				message: 'Donation sent!',
				description: `Transaction ${res.transactionHash}`,
			});
		} catch (err) {
			console.warn(err);
			notification.error({
				message: 'Donation failed to send!',
				description: 'There was an error',
			});
		} finally {
			setIsLoading(null);
		}
	};

	const onChangeVotesInputs = (id) => ({ target: { value } }) => {
		// console.log(ev);
		// console.log(ev.target.value);
		setVotesInputState({
			...votesInputState,
			[id]: value,
		});
	};

	return (
		(loading && <Loading loadingText={`Loading`} />) ||
		(!loading && (
			<PageLayout>
				<MainStack>
					<BackSearchResultStack>
						<BackButton icon={backArrowIcon} path={pathHome} />
						<SearchStack>
							{/* <Title>{label}</Title> */}
							<Title>{label}</Title>
							<Text>({address})</Text>
							{/* <FormSearchName initialName={name} setSearchedName={setLowercaseSearchedName} /> */}
						</SearchStack>

						{proposals.map((proposal, i) => (
							<Card key={proposal.id} style={{ textAlign: 'left' }}>
                <Typography.Paragraph style={{ display: 'flex', justifyContent: 'space-between'}}>
                  <strong>{proposal.name}</strong>
                  <div style={{ fontSize: '12px', fontWeight: 'lighter' }}>
                    id: {proposal.id}
                  </div>
                </Typography.Paragraph>
                <Typography.Paragraph>
                  {proposal.description}
                </Typography.Paragraph>
                <Typography.Paragraph>
                  Tags:&nbsp;
                  {proposal.tags.split(',').map((t: string) => (<Tag>{t.trim()}</Tag>))}
                </Typography.Paragraph>
                <Space>
                  <Input
                    placeholder="amount in ushell"
                    type="number"
                    value={votesInputState[proposal.id]}
                    onChange={onChangeVotesInputs(proposal.id)}
                    disabled={isLoading === proposal.id}
                    // formatter={value => `${value}%`}
                    // parser={value => value.replace('%', '')}
                  />
                  <Button
                    type="primary"
                    onClick={onVoteCreate(proposal.id)}
                    disabled={isLoading === proposal.id}
                    loading={isLoading === proposal.id}
                  >
                    Donate
                  </Button>
                </Space>
							</Card>
							// <Link key={proposal.id} to={`${pathContract}/${label.toLowerCase()}/${address}/`}>
							//   <Button type="primary">{proposal.name}</Button>
							// </Link>
						))}
						<FormCreateProposal onCreateProposal={getProposals} />
						{/* {searchedName && (
              <SearchResult
                contractLabel={label}
                contractAddress={address}
                name={searchedName}
                setLoading={setLoading}
              />
            )} */}
					</BackSearchResultStack>
					<YourAccount tag="footer" />
				</MainStack>
			</PageLayout>
		))
	);
}
