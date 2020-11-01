// import { DatePicker } from 'antd';
import { Formik } from "formik";
import { Form, FormItem, Input, DatePicker, InputNumber, SubmitButton } from "formik-antd";
import React, { useState } from "react";
import styled from "styled-components";
import { printableBalance, useAccount } from "@cosmicdapp/logic";
import { Modal, Button, Descriptions } from "antd";
import { useError, useSdk } from "@cosmicdapp/logic";
import { config } from "../../../config";

// import Search from '../../../forms/Search';
// import { SearchValidationSchema } from '../../../forms/validationSchemas';

// interface FormSearchNameProps {
//   readonly initialName?: string;
//   readonly setSearchedName: (value: React.SetStateAction<string>) => void;
// }
interface FormNewInstantiationProps {
  // readonly initialName?: string;
  // readonly setSearchedName: (value: React.SetStateAction<string>) => void;
  // readonly onCreateInstantiation: (value: React.SetStateAction<any>) => void;
  readonly onCreateInstantiation: () => void;
}

const WideInputNumber = styled(InputNumber)`
  .ant-input-number {
    width: 100%;
  }
`;

export function FormNewInstantiation({
  // initialName,
  // setSearchedName,
  onCreateInstantiation,
}: FormNewInstantiationProps): JSX.Element {
  const { getClient } = useSdk();

  const accountProvider = useAccount();
  const { address, balance } = accountProvider.account ?? {
    address: "",
    balance: [],
  };
  console.log(balance);

  const [modalIsVisible, setModalIsVisible] = useState(false);

  async function handleCreateInstantiation({
    name,
    // description = '',
    // tags = '',
    proposerWhitelist = [],
    voterWhitelist = [],
    proposalPeriodStart = Math.floor(Date.now() / 1e3),
    proposalPeriodEnd = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 31 * 12,
    votingPeriodStart = Math.floor(Date.now() / 1e3),
    votingPeriodEnd = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 31 * 12,
    budgetAmount = 10000,
    budgetDenom = "ucosm",
  }: {
    name: string;
    // description: string;
    // tags: string,
    proposerWhitelist: string[];
    voterWhitelist: string[];
    proposalPeriodStart: number;
    proposalPeriodEnd: number;
    votingPeriodStart: number;
    votingPeriodEnd: number;
    budgetAmount: number;
    budgetDenom: string;
  }) {
    // const rand = Math.floor(Math.random() * 1e6);
    const projectName = name || `Funding ${Math.floor(Math.random() * 1e6)}`;
    const initMsg = {
      name: projectName,
      // description,
      // tags,
      proposer_whitelist: proposerWhitelist,
      voter_whitelist: voterWhitelist,
      proposal_period_start: proposalPeriodStart,
      proposal_period_end: proposalPeriodEnd,
      voting_period_start: votingPeriodStart,
      voting_period_end: votingPeriodEnd,
    };
    const initOptions = {
      memo: "memo",
      transferAmount: [{ denom: budgetDenom, amount: String(budgetAmount) }],
    };
    console.log("initMsg", initMsg);
    // TODO: make this into a form
    // TODO: show spinner while loading
    // try {
    const res = await getClient().instantiate(config.codeId, initMsg, projectName, initOptions);
    // TODO: show success message
    // setContracts([...contracts, ])
    // getInstantiationsList();
    onCreateInstantiation();

    return res;
    // } catch (err) {
    //   // setError(err);
    // }
  }

  return (
    <>
      <Button type="primary" onClick={() => setModalIsVisible(true)}>
        {/* <Button type="primary" onClick={onCreateInstantiation}> */}
        New Project
      </Button>
      <Modal
        onOk={() => setModalIsVisible(false)}
        onCancel={() => setModalIsVisible(false)}
        visible={modalIsVisible}
      >
        <Formik
          // initialValues={{ name: initialName }}
          initialValues={{ name: "", proposerWhitelist: "", voterWhitelist: "" }}
          // validationSchema={SearchValidationSchema}
          validate={(values: { [key: string]: any }) => {
            const errors: { [key: string]: any } = {};
            if (!values.name || values.name.length < 5) {
              errors.name = "Invalid name";
            }
            if (balance && values.budgetAmount > balance[0].amount) {
              errors.budgetAmount = "Funding pool amount exceeds account balance";
            }
            console.log(balance[0]);
            if (values.budgetAmount < 100) {
              errors.budgetAmount = "Funding pool amount is too low";
            }
            // if (values.description.length < 5) {
            //   errors.description = 'Description required';
            // }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting, setFieldError, resetForm }) => {
            // setSearchedName(values.name);
            console.log("create instantiation", values);

            const params = {
              name: values.name,
              // description: values.description,
              proposerWhitelist: values.proposerWhitelist.split(",").map((s) => s.trim()),
              voterWhitelist: values.voterWhitelist.split(",").map((s) => s.trim()),
              proposalPeriodStart: values.proposalPeriod[0].unix(),
              proposalPeriodEnd: values.proposalPeriod[1].unix(),
              votingPeriodStart: values.votingPeriod[0].unix(),
              votingPeriodEnd: values.votingPeriod[1].unix(),
              budgetAmount: values.budgetAmount,
              budgetDenom: "ucosm",
            };

            console.log(params);
            try {
              const res = await handleCreateInstantiation(params);
              console.log("res", res);
              setModalIsVisible(false);
            } catch (error) {
              console.warn(error);
              setFieldError("general", error.message);
            }
            setSubmitting(false);
            resetForm();

            // onCreateInstantiation({
            //   ...values,
            //   voterWhitelist: values.voterWhitelist.split(','),
            //   proposerWhitelist: values.proposerWhitelist.split(','),
            // });
          }}
        >
          {(formikProps) => (
            <Form layout="vertical">
              {formikProps.errors.general && <div style={{ color: "red" }}>{formikProps.errors.general}</div>}
              <FormItem name="name" label="Project name">
                <Input name="name" />
              </FormItem>
              {/* <FormItem name="description" label="Project description">
                <Input name="description" />
              </FormItem>
              <FormItem name="tags" label="Project tags">
                <Input name="tags" />
              </FormItem> */}
              <FormItem label="Proposer whitelist (comma separated addresseses)" name="proposerWhitelist">
                <Input name="proposerWhitelist" />
              </FormItem>
              <Form.Item label="Voter whitelist (comma separated addresses)" name="voterWhitelist">
                <Input name="voterWhitelist" />
              </Form.Item>
              <Form.Item label="Proposal period" name="proposalPeriod">
                <DatePicker.RangePicker showTime name="proposalPeriod" />
              </Form.Item>
              <Form.Item label="Voting period" name="votingPeriod">
                <DatePicker.RangePicker showTime name="votingPeriod" />
              </Form.Item>
              <Form.Item label="Funding Pool (in ucosm)" name="budgetAmount">
                <WideInputNumber style={{ width: "100%" }} name="budgetAmount" />
              </Form.Item>
              <Input name="budgetDenom" type="hidden" value="ucosm" />
              <SubmitButton>Submit</SubmitButton>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}
