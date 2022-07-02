import React, { useEffect, useState } from "react";
import Form from "@awsui/components-react/form";
import FormField from "@awsui/components-react/form-field";
import Input from "@awsui/components-react/input";
import Select, { SelectProps } from "@awsui/components-react/select";
import Container from "@awsui/components-react/container";
import Header from "@awsui/components-react/header";
import SpaceBetween from "@awsui/components-react/space-between";
import Button from "@awsui/components-react/button";
import ProgressBar from "@awsui/components-react/progress-bar";
import StatusIndicator from "@awsui/components-react/status-indicator";

import { SUPPORT_LANGUAGES, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } from "../../assets/config";
import { createTranslationJob, describeTranslationJob, listAlbums, uploadFile } from "../../utils/s3utils";

const FileTranslationForm = (jobId) => {
  const [translationJobIsLoading, setTranslationJobIsLoading] = useState(false);
  const [translationJob, setTranslationJob] = useState(null);

  const loadTranslationJob = () => {
    describeTranslationJob(jobId)
    .then(response => {
      console.log(response);
      setTranslationJob(response.data);
    })
    .catch(e => {
      console.error(e);
      alert("An error occured. Please try again later");
    })
    .finally(() => {
      setTranslationJobIsLoading(false);
    })
  }

  
  useEffect(() =>  {
    setTranslationJobIsLoading(true);
    loadTranslationJob();
    setInterval(() => loadTranslationJob(), 5000);
  }, [])

  const getStatusIndicator = (translationJobStatus: string) => {
    const statusMap = {
      "SUBMITTED": "pending",
      "IN_PROGRESS": "in-progress",
      "COMPLETED": "success",
      "COMPLETED_WITH_ERROR": "error",
      "FAILED": "error",
      "STOP_REQUESTED": "stopped",
      "STOPPED": "stopped"
    }
    if (translationJobStatus in statusMap) 
      return statusMap[translationJobStatus]
    else
      return "stopped"; 
  }

  return (
    <Form
      header={
        <Header variant="h1" description="Detail">
          Translation job
        </Header>
      }
    >
      <Container header={<Header variant="h2">Translation job #{jobId}</Header>}>
      {(!translationJobIsLoading && !!translationJob) ? (
        <>
          <p>Job name: {translationJob?.JobName}</p>
          <p>Job status: <StatusIndicator type={getStatusIndicator(translationJob?.JobStatus)} />{translationJob?.JobStatus}</p>
          <p>S3 output: {translationJob?.OutputDataConfig?.S3Uri}</p>
        </>
        ) : (
          <StatusIndicator type="loading" />
        )
      }
      </Container>
      
    </Form>
  )
}

export default FileTranslationForm;