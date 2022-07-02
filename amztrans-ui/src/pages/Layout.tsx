import React from "react";
import AppLayout from "@awsui/components-react/app-layout";
import FileTranslationForm from "../../components/FileTranslationForm";
import SpaceBetween from "@awsui/components-react/space-between";
import Header from "@awsui/components-react/header";
import Container from "@awsui/components-react/container";
import Cards from "@awsui/components-react/cards";
import Link from "@awsui/components-react/link";

const DefaultAppLayout = ({ content }) => {
    return (
        <AppLayout
            navigation={
                <Container header={<Header variant="h2">Translate</Header>}>
                <SpaceBetween>
                    <Cards
                    cardDefinition={{
                        header: <p>Cards header</p>,
                        sections: [{
                        id: "id",
                        content: "card content",
                        header: "card header",
                        width: 100
                        }]
                    }}
                    />
                    <Link href="/upload">File upload</Link>
                    <Link href="/jobs">Translation jobs</Link>
                </SpaceBetween>
                </Container>
            }
            tools={<p>Tools</p>}
            content={content}
        />
    )
}
export default DefaultAppLayout;
