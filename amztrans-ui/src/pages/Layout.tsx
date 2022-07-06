import React from "react";
import AppLayout from "@awsui/components-react/app-layout";
import Header from "@awsui/components-react/header";
import Container from "@awsui/components-react/container";
import { Button, Link, SideNavigation } from "@awsui/components-react";

const Tools = () => {
    return (
        <>
            <Container header={<Header variant="h2">Upload and translate your document</Header>}>
                <Button 
                    variant="link"
                    iconName="external"
                    target="blank"
                    href="https://github.com/CaoHoangTung/aws-translation/"
                >
                    Github repository
                </Button>
            </Container>
        </>
    )
}

const Navigation = () => {
    const currentUrl = window.location.pathname;
    const activeHref = currentUrl.split("/").slice(0, 2).join("/");

    return (
        <>
            <SideNavigation 
                activeHref={activeHref}
                header={{
                    "text": "AMZ Trans",
                    "href": "/"
                }}
                items={[
                    {
                        type: "link",
                        text: "Upload files",
                        href: "/upload",
                    },
                    {
                        type: "link",
                        text: "Translation results",
                        href: "/result",
                    }
                ]}
            />
        </>
    )
}

const DefaultAppLayout = ({ content }) => {
    return (
        <AppLayout
            navigation={Navigation()}
            tools={Tools()}
            content={content}
        />
    )
}
export default DefaultAppLayout;
