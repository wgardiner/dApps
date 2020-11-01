// import { DatePicker } from 'antd';
import { Formik } from "formik";
import { Form, FormItem, Input, DatePicker, InputNumber, SubmitButton } from "formik-antd";
import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { printableBalance, useAccount } from "@cosmicdapp/logic";
import { Modal, Button, Descriptions } from "antd";
import { useError, useSdk } from "@cosmicdapp/logic";

// import Search from '../../../forms/Search';
// import { SearchValidationSchema } from '../../../forms/validationSchemas';

// interface FormSearchNameProps {
//   readonly initialName?: string;
//   readonly setSearchedName: (value: React.SetStateAction<string>) => void;
// }
interface FormCreateProposalProps {
  readonly onCreateProposal: () => void;
}

const WideInputNumber = styled(InputNumber)`
  .ant-input-number {
    width: 100%;
  }
`;

interface ContractParams {
  readonly label: string;
  readonly address: string;
  readonly name?: string;
}

export function FormCreateProposal({ onCreateProposal }: FormCreateProposalProps): JSX.Element {
  const { label, address, name } = useParams() as ContractParams;

  const { getClient } = useSdk();

  const accountProvider = useAccount();
  const { address: accountAddress, balance } = accountProvider.account ?? {
    address: "",
    balance: [],
  };
  console.log(balance);

  const [modalIsVisible, setModalIsVisible] = useState(false);
  async function handleProposalCreate({
    name,
    recipient,
    description,
    tags,
  }: {
    name: string;
    recipient: string;
    description: string;
    tags: string;
  }) {
    const rand = Math.floor(Math.random() * 1e6);
    const handleMsg = {
      create_proposal: {
        // name: `Proposal ${rand}`,
        // recipient: 'coral1ndn0wv022sc3zkkzuyk76f2en6sftghvezs0hc',
        // description: `Description for Proposal ${rand}`,
        // tags: `space kittens, plants`,
        name,
        recipient,
        description,
        tags,
      },
    };

    // try {
    console.log("----------stuff for exec", address, handleMsg);

    const res = await getClient().execute(
      address,
      handleMsg,
      "create proposal",
      // [
      //   { denom: "ucosm", amount: "1000" },
      // ]
    );
    // getClient.execute()
    console.log(res);
    // getProposals();
    // } catch (err) {
    //   console.warn(err);
    // }
    return res;
  }

  return (
    <>
      <Button type="primary" onClick={() => setModalIsVisible(true)}>
        New Proposal
      </Button>

      {/* <Button type="primary" onClick={onProposalCreate}>
							New Proposal
						</Button> */}
      <Modal
        onOk={() => setModalIsVisible(false)}
        onCancel={() => setModalIsVisible(false)}
        visible={modalIsVisible}
      >
        <Formik
          // initialValues={{ name: initialName }}
          initialValues={{ name: "" }}
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
            if (values.description.length < 5) {
              errors.description = "Description required";
            }
            if (values.tags.length < 5) {
              errors.tags = "Tags required";
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting, setFieldError, resetForm }) => {
            // setSearchedName(values.name);
            const { name, recipient, tags, description } = values;
            console.log("create proposal", values);

            const params = {
              name,
              recipient,
              tags,
              description,
            };

            console.log(params);
            try {
              const res = await handleProposalCreate(params);
              // console.log('res', res);
              setModalIsVisible(false);
              onCreateProposal();
            } catch (error) {
              console.warn(error);
              setFieldError("general", error.message);
            }
            setSubmitting(false);
            resetForm();
          }}
        >
          {(formikProps) => (
            <Form layout="vertical">
              {formikProps.errors.general && <div style={{ color: "red" }}>{formikProps.errors.general}</div>}
              <FormItem name="name" label="Proposal name">
                <Input name="name" />
              </FormItem>
              <FormItem name="description" label="Proposal description">
                <Input name="description" />
              </FormItem>
              <FormItem name="tags" label="Proposal tags">
                <Input name="tags" />
              </FormItem>
              <FormItem label="Recipient address" name="recipient">
                <Input name="recipient" />
              </FormItem>
              <SubmitButton>Submit</SubmitButton>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}
