import { FormCreateProposal } from "./components/FormCreateProposal";
import { BackButton, Loading, PageLayout } from "@cosmicdapp/design";
import { YourAccount } from "../../components/logic/YourAccount";
import { Button, Typography, Input, InputNumber, Card, notification, Space, Tag, Modal } from "antd";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import backArrowIcon from "../../assets/backArrow.svg";
import { pathHome } from "../../paths";
import { Link } from "react-router-dom";
// import { FormSearchName } from "./components/FormSearchName";
// import { SearchResult } from "./components/SearchResult";
import { BackSearchResultStack, MainStack, SearchStack } from "./style";
import { pathContract } from "../../paths";
import { Coin } from "@cosmjs/launchpad";

import { /*getErrorFromStackTrace, printableCoin, useAccount,*/ useError, useSdk } from "@cosmicdapp/logic";
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
    // readonly [key: string]: any;
    readonly id: number;
    readonly description: string;
    readonly name: string;
    readonly recipient: string;
    readonly tags: string;
  }

  interface Vote {
    readonly voter: string;
    proposal: number;
    amount: Coin[];
  }
  interface ProposalState {
    proposal: Proposal;
    votes: Vote[];
  }

  interface InstantiationState {
    name: string;
    proposal_period_end: number;
    proposal_period_start: number;
    voting_period_end: number;
    voting_period_start: number;
    proposer_whitelist: string[];
    voter_whitelist: string[];
  }

  interface Distribution {
    distribution_actual: Coin;
    distribution_ideal: Coin;
    proposal: number;
    recipient: string;
    subsidy_actual: Coin;
    subsidy_ideal: Coin;
    votes: Coin[];
  }

  const [proposals, setProposals] = useState<readonly Proposal[]>([]);
  const [instantiationState, setInstantiationState] = useState<InstantiationState>({
    name: undefined,
    proposal_period_end: undefined,
    proposal_period_start: undefined,
    voting_period_end: undefined,
    voting_period_start: undefined,
    proposer_whitelist: [],
    voter_whitelist: [],
  });
  // const [proposalsState, setProposalsState] = useState({});
  const [proposalsState, setProposalsState] = useState<ProposalState[]>([]);
  const [votingPeriodIsValid, setVotingPeriodIsValid] = useState(false);
  const [proposalPeriodIsValid, setProposalPeriodIsValid] = useState(false);
  const [distributionsCheck, setDistributionsCheck] = useState<Distribution[]>([]);
  const [distCheckModalIsVisible, setDistCheckModalIsVisible] = useState(false);

  const { setError, error } = useError();
  const { getClient } = useSdk();

  async function getProposalList(): Promise<Proposal[]> {
    console.log("getProposalList");
    try {
      const res = await getClient().queryContractSmart(address, { proposal_list: {} });
      console.log(res);
      setProposals(res.proposals);
      return res.proposals;
    } catch (err) {
      console.warn(error);
    }
    return [];
  }

  async function getInstantiationState() {
    try {
      console.log("contract address", address);
      const res = await getClient()
        // .queryContractSmart(address, { resolve_record: { name } })
        // one of`get_state`, `proposal_list`, `proposal_state`
        .queryContractSmart(address, { get_state: {} });
      console.log("instantiation state", res);
      setInstantiationState(res);
      const now = Math.floor(Date.now() / 1e3);

      // Check if proposal period has started.
      const proposal_started = !!res.proposal_period_start && res.proposal_period_start < now;
      const proposal_ended = !!res.proposal_period_end && res.proposal_period_end < now;
      setProposalPeriodIsValid(proposal_started && !proposal_ended);

      // Check if voting period has started.
      const voting_started = !!res.voting_period_start && res.voting_period_start < now;
      const voting_ended = !!res.voting_period_end && res.voting_period_end < now;
      setVotingPeriodIsValid(voting_started && !voting_ended);
    } catch (err) {
      console.warn(err);
    }
  }

  async function getProposalsState(ids?: number[]) {
    console.log("getProposalsState", ids, proposals);
    try {
      const propsState = Promise.all(
        // (ids || proposals.map((p) => p.id)).map((id) => {
        ids.map((id) => {
          return getClient().queryContractSmart(address, { proposal_state: { proposal_id: id } });
        }),
      );
      const res = await propsState;
      console.log("getProposalsState", res);
      // setProposalsState(res.reduce((r, x) => ({ ...r, [x.id]: { ...x } }), {}));
      setProposalsState(res);
      // setProposalsState({
      //   ...proposalsState,
      //   [id]: res,
      // });
    } catch (err) {
      console.warn(err);
    }
    // (ids || proposals.map((p) => p.id)).forEach(async (id) => {
    //   try {
    //     const res = await getClient().queryContractSmart(address, { proposal_state: { proposal_id: id } });
    //     console.log(res);
    //     setProposalsState({
    //       ...proposalsState,
    //       [id]: res,
    //     });
    //   } catch (err) {
    //     console.warn(err);
    //   }
    // });
  }

  async function getResources() {
    getInstantiationState();
    const proposalsList = await getProposalList();
    console.log("prop list", proposalsList);
    getProposalsState(proposalsList.map((p) => p.id));
  }

  (window as any).client = getClient();

  useEffect(() => {
    // console.log('useeffect');
    // console.log(address);
    // (window as any).getClient = getClient;
    // (window as any).address = address;
    // console.log(label, name, address);
    getResources();
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
    console.log("create vote", id, amount);
    // console.log(`execute('create_vote', { proposal: ${id}, amount: [{amount: ${amount}}]})`);
    try {
      setIsLoading(id);
      const res = await getClient().execute(address, handleMsg, "create vote", [
        { denom: "ucosm", amount: String(amount) },
      ]);

      // getClient.execute()
      console.log(res);
      // getResources();
      const { [id]: _, ...rest } = votesInputState;
      console.log("-------", id, _, rest, votesInputState);
      setVotesInputState({ ...rest });
      notification.success({
        message: "Donation sent!",
        description: `Transaction ${res.transactionHash}`,
      });
    } catch (err) {
      console.warn(err);
      notification.error({
        message: "Donation failed to send!",
        description: "There was an error",
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

  async function handleStartProposalPeriod() {
    try {
      const client = getClient();
      const res = await client.execute(address, { start_proposal_period: { time: null } });
      console.log(res);
      notification.success({
        message: "Started proposal period!",
        description: `Transaction ${res.transactionHash}`,
      });
      await getInstantiationState();
    } catch (err) {
      console.warn(err);
      notification.error({
        message: "Error starting proposal period.",
        description: "There was an error",
      });
    }
  }

  async function handleEndProposalPeriod() {
    try {
      const client = getClient();
      const res = await client.execute(address, { end_proposal_period: { time: null } });
      console.log(res);
      notification.success({
        message: "Ended proposal period!",
        description: `Transaction ${res.transactionHash}`,
      });
      await getInstantiationState();
    } catch (err) {
      console.warn(err);
      notification.error({
        message: "Error ending proposal period.",
        description: "There was an error",
      });
    }
  }

  async function handleStartVotingPeriod() {
    try {
      const client = getClient();
      const res = await client.execute(address, { start_voting_period: { time: null } });
      console.log(res);
      notification.success({
        message: "Started voting period!",
        description: `Transaction ${res.transactionHash}`,
      });
      await getInstantiationState();
    } catch (err) {
      console.warn(err);
      notification.error({
        message: "Error starting voting period.",
        description: "There was an error",
      });
    }
  }

  async function handleEndVotingPeriod() {
    try {
      const client = getClient();
      const res = await client.execute(address, { end_voting_period: { time: null } });
      console.log(res);
      notification.success({
        message: "Ended voting period!",
        description: `Transaction ${res.transactionHash}`,
      });
      await getInstantiationState();
    } catch (err) {
      console.warn(err);
      notification.error({
        message: "Error ending voting period.",
        description: "There was an error",
      });
    }
  }

  async function handleCheckDistributions() {
    try {
      const client = getClient();
      // //@ts-ignore
      // client.fees.exec = {
      //   gas: "50000",
      //   amount: [
      //     {
      //       amount: "500",
      //       denom: "ucosm",
      //     },
      //   ],
      // };
      const res = await client.execute(
        address,
        { check_distributions: {} },
        "check distributions",
        // [{ amount: "50000", denom: "ucosm" }],
      );
      console.log(res);
      const resData = JSON.parse(atob(res.logs[0].events[1].attributes[1].value));
      console.log("distributions check data", resData);
      setDistributionsCheck(resData.distributions);
      setDistCheckModalIsVisible(true);
    } catch (err) {
      console.warn(err);
    }
  }
  async function handleDistributeFunds() {
    try {
      const client = getClient();
      // //@ts-ignore
      // client.fees.exec = {
      //   gas: "50000",
      //   amount: [
      //     {
      //       amount: "500",
      //       denom: "ucosm",
      //     },
      //   ],
      // };
      const res = await client.execute(
        address,
        { distribute_funds: {} },
        "distribute funds",
        // [{ amount: "50000", denom: "ucosm" }],
      );
      console.log(res);
    } catch (err) {
      console.warn(err);
    }
  }

  async function handleGetContractState() {
    try {
      const res = await getClient().queryContractSmart(address, { get_state: {} });
      console.log(res);
    } catch (err) {
      console.warn(err);
    }

    proposals.forEach(async (p) => {
      try {
        const res = await getClient().queryContractSmart(address, { proposal_state: { proposal_id: p.id } });
        console.log(res);
      } catch (err) {
        console.warn(err);
      }
    });
  }

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
              <Text>
                Proposal period
                <br />
                {instantiationState.proposal_period_start === null ? (
                  <Button type="primary" onClick={handleStartProposalPeriod}>
                    Start Proposal Period
                  </Button>
                ) : (
                  new Date(instantiationState.proposal_period_start * 1e3).toLocaleString()
                )}
                &nbsp;&mdash;&nbsp;
                {instantiationState.proposal_period_end === null ? (
                  <Button type="primary" onClick={handleEndProposalPeriod}>
                    End Proposal Period
                  </Button>
                ) : (
                  new Date(instantiationState.proposal_period_end * 1e3).toLocaleString()
                )}
              </Text>
              <Text>
                Voting period <br />
                {instantiationState.voting_period_start === null ? (
                  <Button type="primary" onClick={handleStartVotingPeriod}>
                    Start Voting Period
                  </Button>
                ) : (
                  new Date(instantiationState.voting_period_start * 1e3).toLocaleString()
                )}
                &nbsp;&mdash;&nbsp;
                {instantiationState.voting_period_end === null ? (
                  <Button type="primary" onClick={handleEndVotingPeriod}>
                    End Voting Period
                  </Button>
                ) : (
                  new Date(instantiationState.voting_period_end * 1e3).toLocaleString()
                )}
              </Text>
              {/* <FormSearchName initialName={name} setSearchedName={setLowercaseSearchedName} /> */}
            </SearchStack>

            {/* {proposals?.map((proposal, i) => ( */}
            {proposalsState?.map(({ proposal, votes }, i) => (
              <Card key={proposal.id} style={{ textAlign: "left" }}>
                <Typography.Paragraph style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{proposal.name}</strong>
                  <div style={{ fontSize: "12px", fontWeight: "lighter" }}>id: {proposal.id}</div>
                </Typography.Paragraph>
                <Typography.Paragraph>{proposal.description}</Typography.Paragraph>
                <Typography.Paragraph>
                  Tags:&nbsp;
                  {proposal.tags.split(",").map((t: string, i: number) => (
                    <Tag key={i}>{t.trim()}</Tag>
                  ))}
                </Typography.Paragraph>
                {/* <Typography.Paragraph>
                  Total Votes:
                  {votes.reduce((r, x) => r + Number(x.amount[0].amount), 0)}
                </Typography.Paragraph> */}
                <Typography.Paragraph>
                  Votes:&nbsp;
                  {votes.map((v, i) => (
                    <Tag key={i}>{v.amount[0].amount}</Tag>
                  ))}
                </Typography.Paragraph>
                <Space>
                  <Input
                    placeholder="amount in ushell"
                    type="number"
                    value={votesInputState[proposal.id]}
                    onChange={onChangeVotesInputs(proposal.id)}
                    disabled={isLoading === proposal.id || !votingPeriodIsValid}
                    // formatter={value => `${value}%`}
                    // parser={value => value.replace('%', '')}
                  />
                  <Button
                    type="primary"
                    onClick={onVoteCreate(proposal.id)}
                    disabled={isLoading === proposal.id || !votingPeriodIsValid}
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
            <FormCreateProposal onCreateProposal={getResources} periodIsValid={proposalPeriodIsValid} />
            {/* {searchedName && (
              <SearchResult
                contractLabel={label}
                contractAddress={address}
                name={searchedName}
                setLoading={setLoading}
              />
            )} */}
            <Button type="primary" onClick={handleCheckDistributions}>
              Check Distributions
            </Button>
            <Button type="primary" onClick={handleDistributeFunds}>
              Distribute Funds
            </Button>
            <Button type="primary" onClick={handleGetContractState}>
              Get Contract State
            </Button>
          </BackSearchResultStack>
          <YourAccount tag="footer" />
          <Modal
            onOk={() => setDistCheckModalIsVisible(false)}
            onCancel={() => setDistCheckModalIsVisible(false)}
            visible={distCheckModalIsVisible}
          >
            {distributionsCheck?.map((d, i) => {
              return (
                <p style={{ marginTop: "1em" }} key={i}>
                  <div>
                    <strong>Proposal: {d.proposal}</strong>
                  </div>
                  <div>
                    Ideal distribution: {d.distribution_ideal.amount}
                    {d.distribution_ideal.denom}
                  </div>
                  <div>
                    Actual distribution: {d.distribution_actual.amount}
                    {d.distribution_actual.denom}
                  </div>
                  <div>
                    Ideal subsidy: {d.subsidy_ideal.amount}
                    {d.subsidy_ideal.denom}
                  </div>
                  <div>
                    Actual subsidy: {d.subsidy_actual.amount}
                    {d.subsidy_actual.denom}
                  </div>
                  <div>
                    Votes:{" "}
                    {d.votes.map((v, i) => (
                      <Tag key={i}>
                        {v.amount}
                        {v.denom}
                      </Tag>
                    ))}
                  </div>
                </p>
              );
            })}
          </Modal>
        </MainStack>
      </PageLayout>
    ))
  );
}
