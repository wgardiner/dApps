import { BackButton, Loading, PageLayout, YourAccount } from "@cosmicdapp/design";
import { Button, Typography, Input, Card } from "antd";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import backArrowIcon from "../../assets/backArrow.svg";
import { pathHome } from "../../paths";
import { Link } from "react-router-dom";
// import { FormSearchName } from "./components/FormSearchName";
// import { SearchResult } from "./components/SearchResult";
import { BackSearchResultStack, MainStack, SearchStack } from "./style";
import { pathContract } from "../../paths";

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
  const [searchedName, setSearchedName] = useState(name);

  function setLowercaseSearchedName(newName: string) {
    setSearchedName(newName.toLowerCase());
  }

  interface Proposal {
    readonly [key: string]: any,
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
    console.log('useeffect');
    // console.log(address);
    (window as any).getClient = getClient;
    (window as any).address = address;
    // console.log(label, name, address);
    getProposals();

  }, [setError, address, getClient, name]);


  const [votesInputState, setVotesInputState] = useState({});
  const onVoteCreate = (id) => async (ev) => {
    // console.log(ev);
    // console.log(ev.target.value);
    const amount = votesInputState[id];
    const handleMsg = {
      create_vote: {
        proposal_id: id,
      },
    };
    console.log('create vote',id, amount);
    // console.log(`execute('create_vote', { proposal: ${id}, amount: [{amount: ${amount}}]})`);
    try {
      const res = await getClient()
        .execute(address, handleMsg, 'create vote', [{ denom: "ushell", amount: String(amount) }]);
      // getClient.execute()
      console.log(res);
      // getProposals();
    } catch (err) {
      console.warn(err);
    }
  }

  const onChangeVotesInputs = (id) => ({ target: { value }}) => {
    // console.log(ev);
    // console.log(ev.target.value);
    setVotesInputState({
      ...votesInputState,
      [id]: value,
    })
  }

  async function onProposalCreate() {
    const rand = Math.floor(Math.random() * 1e6);
    const handleMsg = {
      create_proposal: {
        name: `Proposal ${rand}`,
        recipient: 'coral1ndn0wv022sc3zkkzuyk76f2en6sftghvezs0hc',
        description: `Description for Proposal ${rand}`,
        tags: `space kittens, plants`,
      },
    };
    // pub struct CreateProposal {
    // pub name: String,
    // pub recipient: HumanAddr,
    // pub description: String,
    // pub tags: String,
    // }

    try {
      const res = await getClient()
        .execute(address, handleMsg, 'create proposal', [{ denom: "ushell", amount: "1000" }]);
        // getClient.execute()
      console.log(res);
      getProposals();
    } catch (err) {
      console.warn(err);
    }

  }

  return (
    (loading && <Loading loadingText={`Registering name: ${searchedName}...`} />) ||
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
                <Card key={proposal.id}>
                  <strong>
                    {proposal.name}
                  </strong>
                  <br/>
                  {proposal.description}
                  <br/>
                  id: {proposal.id}

                  <Input
                    placeholder="amount in ushell"
                    type="number"
                    onChange={onChangeVotesInputs(proposal.id)}
                  />
                  <Button type="primary" onClick={onVoteCreate(proposal.id)}>
                    Vote / Donate
                  </Button>

                </Card>
                // <Link key={proposal.id} to={`${pathContract}/${label.toLowerCase()}/${address}/`}>
                //   <Button type="primary">{proposal.name}</Button>
                // </Link>
              ))}
            <Button type="primary" onClick={onProposalCreate}>New Proposal</Button>
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
