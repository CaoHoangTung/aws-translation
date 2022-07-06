import React from "react";
import AppLayout from "@awsui/components-react/app-layout";
import FileTranslationForm from "../../components/FileTranslationForm";
import SpaceBetween from "@awsui/components-react/space-between";
import Header from "@awsui/components-react/header";
import Container from "@awsui/components-react/container";
import Cards from "@awsui/components-react/cards";
import Link from "@awsui/components-react/link";
import DefaultAppLayout from "../Layout";
import TranslationJobs from "../../components/TranslationJobs";

const TranslationJobsPage = () => {
    return (
        <DefaultAppLayout
            content={
                TranslationJobs()
            }
        />
    )
}
export default TranslationJobsPage;
