import React, { useEffect, useState } from "react";

import { Container, Header, Link, ProgressBar, StatusIndicator, Table } from "@awsui/components-react";
import { listTranslationJobs } from "../../utils/s3utils";

const TranslationJobs = (jobId: string) => {
    const [translationJobs, setTranslationJobs] = useState([]);
    const [translationJobsAreLoading, setTranslationJobsAreLoading] = useState(true);

    useEffect(async () => {
        try {
            const translationHistoryResponse = await listTranslationJobs();
            const translationJobs = translationHistoryResponse.data;

            setTranslationJobs(translationJobs.reverse())
        } catch(err) {
            alert("Cannot fetch translation history. Please try again later");
        } finally {
            setTranslationJobsAreLoading(false);
        }
    }, []);

    return (
        <Container header={<Header variant="h2">Translation history</Header>}>
            {!!translationJobsAreLoading ? (
                <StatusIndicator type="loading" />
            ) : (
                <Table
                    columnDefinitions={[
                        {id: "name", header: "Name", cell: (item => <Link href={`result/${item.JobId}`}>{item.JobName}</Link>)},
                        {id: "sourceLang", header: "Source language", cell: (item => <span>{item.SourceLanguageCode}</span>)},
                        {id: "targetLang", header: "Target language", cell: (item => <span>{item.TargetLanguageCodes[0]}</span>)},
                        {id: "status", header: "Status", cell: (item => <span>{item.JobStatus}</span>)},
                        {id: "creationDate", header: "Creation date", cell: (item => <span>{new Date(item.SubmittedTime).toString()}</span>)},
                    ]}
                    items={translationJobs}
                />
            )}
        </Container>
    )
}

export default TranslationJobs;