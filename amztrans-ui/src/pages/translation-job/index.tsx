import React from "react";
import { useParams } from "react-router-dom";
import TranslationJobDetail from "../../components/TranslationJobDetail";
import DefaultAppLayout from "../Layout";

const TranslationJob = () => {
    let { jobId } = useParams();
    
    return (
        <DefaultAppLayout
            content={TranslationJobDetail(jobId)}
        />
    )
}
export default TranslationJob;
