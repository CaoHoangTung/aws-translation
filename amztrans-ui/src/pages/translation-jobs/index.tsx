import React from "react";
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
