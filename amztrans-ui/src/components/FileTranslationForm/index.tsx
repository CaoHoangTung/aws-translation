import React, { useState } from "react";
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
import { createTranslationJob, listAlbums, uploadFile } from "../../utils/s3utils";
import { useNavigate } from "react-router-dom";

const FileTranslationForm = () => {
  const navigate = useNavigate();

  const [sourceLang, setSourceLang] = useState({
    "label": DEFAULT_SOURCE_LANGUAGE,
    "value": DEFAULT_SOURCE_LANGUAGE
  });
  const [targetLang, setTargetLang] = useState({
    "label": DEFAULT_TARGET_LANGUAGE,
    "value": DEFAULT_TARGET_LANGUAGE
  });

  const [jobName, setJobName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [filesAreUploading, setFilesAreUploading] = useState(false);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [uploadId, setUploadId] = useState(""); // after upload to S3, upload id will be filled

  const [translationJobIsCreating, setTranslationJobIsCreating] = useState(false);

  const selectHandler = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
    console.log("SELECT", files);
  };

  const submissionHandler = async () => {
    setFilesAreUploading(true);
    console.log("Submitting");
    console.log("Source", sourceLang);
    console.log("Target", targetLang);
    console.log("Files", selectedFiles);

    const randomElement = (Math.random() + 1).toString(36).substring(7);
    const today = (new Date()).toISOString().substring(0,10);
    const bucketKey = `public/${today}/${sourceLang.value}2${targetLang.value}-${jobName}-${randomElement}`;
    
    for (let file of selectedFiles) {
      await uploadFile(bucketKey, file);
      setUploadedFilesCount(uploadedFilesCount+1);
    }
    setUploadId(bucketKey);
    setFilesAreUploading(false);
  };

  const resetUpload = () => {
    setUploadId("");
    setSelectedFiles([]);
    setUploadedFilesCount(0);
  }


  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          {translationJobIsCreating  && (
            <StatusIndicator type="loading" />
          )}
          <Button variant="primary" 
            disabled={translationJobIsCreating || !uploadId}
            onClick={() => {
              setTranslationJobIsCreating(true);
              createTranslationJob(
                jobName, 
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                sourceLang.value, 
                targetLang.value, 
                uploadId
              ).then(response => {
                console.log(response);
                navigate(`/jobs/${response?.data?.response.JobId}`);
              })
              .catch(error => {
                console.log(error);
                alert("An error occured. Please check the log and try again")
              })
              .finally(() => {
                setTranslationJobIsCreating(false);
              });
            }}>
              Create translation job
            </Button>
        </SpaceBetween>
      }
      header={
        <Header variant="h1" description="Upload and translate your document">
          Amazon Translation Demo
        </Header>
      }
    >
      <Container header={<Header variant="h2">Upload and translate your document</Header>}>
        <SpaceBetween direction="vertical" size="l">
          <FormField label="Job name" description="Name for translation job">
            <Input value={jobName} onChange={(event) => setJobName(event.detail.value)} />
          </FormField>
          <FormField label="Source language" errorText={!sourceLang && "Please select a value"}>
            <Select
              options={SUPPORT_LANGUAGES.map((lang: string) => ({
                "label": lang,
                "value": lang
              }))}
              selectedOption={sourceLang}
              onChange={(event) => setSourceLang(event.detail.selectedOption)}
              selectedAriaLabel="selected"
            />
          </FormField>
          <FormField label="Target language" errorText={!targetLang && "Please select a value"}>
            <Select
              options={SUPPORT_LANGUAGES.map((lang: string) => ({
                "label": lang,
                "value": lang
              }))}
              selectedOption={targetLang}
              onChange={(event) => setTargetLang(event.detail.selectedOption)}
              selectedAriaLabel="selected"
            />
          </FormField>

          {!uploadId ? (
            <SpaceBetween>
              <FormField errorText={!targetLang && "Please select a value"}>
                <Button iconName="add-plus">
                  <label htmlFor="files">Select multiple files</label>
                  <input id="files" style={{display: "none"}} type="file" multiple name="files" onChange={selectHandler} />
                </Button>
                {selectedFiles.length > 0 ? (
                      <div>
                        <p>
                          {selectedFiles.length} files selected 
                          <Button iconName="close" onClick={() => setSelectedFiles([])}></Button>
                        </p>
                        {!!jobName && (
                          <Button disabled={filesAreUploading} variant="primary" onClick={submissionHandler}>Upload</Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <p>Select files to upload</p>
                      </>
                    )}
              </FormField>
            </SpaceBetween>
          ) : (
            <SpaceBetween>
              <FormField label="S3 input path">
                <Input disabled value={uploadId} />
              </FormField>
              <Button iconName="close" onClick={() => resetUpload()}></Button>
            </SpaceBetween>
          )}

          {!!filesAreUploading && (
            <>
              <ProgressBar 
                description={`(${uploadedFilesCount+1}/${selectedFiles.length}) Uploading ${selectedFiles[uploadedFilesCount].name} `} 
                value={(uploadedFilesCount+1) / selectedFiles.length * 100}
              />
              <StatusIndicator type="loading" />
            </>
          )}
        </SpaceBetween>
      </Container>
    </Form>
  )
}

export default FileTranslationForm;