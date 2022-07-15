import { requiredValidator } from "aws-cdk-lib";
import infra from "./amztrans-infra.png";
import React from "react";
import { Container, Header } from "@awsui/components-react";

const HomeContent = () => {
  return (
    <Container>
      <Header variant="h1" description="Translate multiple files at once">AMZ Trans</Header>
      <br/>
      <img src={infra} width="100%" />
    </Container>
  )
}

export default HomeContent;