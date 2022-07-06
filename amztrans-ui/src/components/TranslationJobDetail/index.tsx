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
import { createTranslationJob, describeTranslationJob, listAlbums, listTranslatedFiles, uploadFile, fetchBuckets, fetchObjects, fetchVersions, getFileNameFromPath, getDownloadURL} from "../../utils/s3utils";
import { ColumnLayout, Icon, S3ResourceSelector, TextContent } from "@awsui/components-react";
import { useNavigate } from "react-router-dom";
import { getTimeDiff } from "../../utils/timeutils";

const FileBrowser = ( { s3OutputPrefix, filePrefix } ) => {
  const [objectList, setObjectList] = useState([]);
  const [objectListIsFetching, setObjectListIsFetching] = useState(true);
  
  useEffect(async () => {
    console.log("Fetching objects from", s3OutputPrefix);
    let s3Response = await listTranslatedFiles(s3OutputPrefix, filePrefix);
    console.log("S3 response", s3Response);
    setObjectList(s3Response.Contents || []);
    setObjectListIsFetching(false);
  }, []);

  return (
    <>
      {objectListIsFetching ? (
        <StatusIndicator type="loading" />
      ) : (
        <>
          {objectList.map(object => (
            <div key={object.Key}>
              <Button 
                type="file"
                variant="link"
                iconName="download"
                onClick={async () => {
                  const downloadURL = await getDownloadURL(object.Key);
                  console.log("DOWNLOAD URL", downloadURL);
                  window.location.replace(downloadURL);
                }}
              >
                {getFileNameFromPath(object.Key)}
              </Button>
            </div>
          ))}
        </>
      )}
    </>
  )
}

const TranslationJobDetail = (jobId: string) => {
  const [translationJobIsLoading, setTranslationJobIsLoading] = useState(false);
  const [translationJob, setTranslationJob] = useState(null);
  const [s3OutputPrefix, setS3OutputPrefix] = useState(null);

  const loadTranslationJob = async () => {
    try {
      let translationResponse = await describeTranslationJob(jobId);
      setTranslationJob(translationResponse.data);
      console.log("Trans detail", translationResponse.data)

      let s3OutputURI = translationResponse.data.OutputDataConfig.S3Uri;
      s3OutputURI = s3OutputURI.replace("s3://", "");
      s3OutputURI = s3OutputURI.split("/").slice(1, -1).join("/");
      setS3OutputPrefix(s3OutputURI);
    } catch(err) {
      console.error(err);
      alert("An error occured. Please try again later");
    } finally {
      setTranslationJobIsLoading(false);
    }
  }

  
  useEffect(() =>  {
    setTranslationJobIsLoading(true);
    loadTranslationJob();
    setInterval(() => loadTranslationJob(), 60000);
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
        <Header variant="h1" description="Translated files will be available for 24 hours">
          Translation result
        </Header>
      }
    >
      <Container header={<Header variant="h2">Translation job #{jobId}</Header>}>
      {(!translationJobIsLoading && !!translationJob) ? (
        <>
          <ColumnLayout
            columns={3}
          >
            <div>
              <Header variant="h6">Download translated files</Header>
              {(!!s3OutputPrefix && translationJob?.JobStatus === "COMPLETED") ? (
                  <FileBrowser s3OutputPrefix={s3OutputPrefix} filePrefix={translationJob?.TargetLanguageCodes[0]} />
              ) : (
                <TextContent>No files available</TextContent>
              )}
            </div>
            <div>
              <Header variant="h6">Translation status</Header>
              <StatusIndicator type={getStatusIndicator(translationJob?.JobStatus)} />{translationJob?.JobStatus}
            </div>
            <div>
              <Header variant="h6">Execution time</Header>
              <TextContent>
                {!!translationJob?.EndTime ? (
                  getTimeDiff(new Date(translationJob.EndTime), new Date(translationJob.SubmittedTime))
                ) : (
                  getTimeDiff(new Date(), new Date(translationJob.SubmittedTime))
                )}
              </TextContent>
            </div>
          </ColumnLayout>
          <br/>
        </>
        ) : (
          <StatusIndicator type="loading" />
        )
      }
      </Container>
    </Form>
  )
}

export default TranslationJobDetail;