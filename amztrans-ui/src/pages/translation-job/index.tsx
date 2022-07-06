import React from "react";
import DefaultAppLayout from "../Layout";
import TranslationJobDetail from "../../components/TranslationJobDetail";
import { useParams } from "react-router-dom";

const TranslationJobDetailPage = () => {
    const { jobId } = useParams();

    return (
        <DefaultAppLayout
            content={
                TranslationJobDetail(jobId)
            }
        />
    )
}
export default TranslationJobDetailPage;
