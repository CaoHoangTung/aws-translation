import React, { useCallback, useEffect, useState } from "react";
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
import { SUPPORT_LANGUAGES, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE, SUPPORT_FILETYPES } from "../../assets/config";
import { createTranslationJob, listAlbums, uploadFile } from "../../utils/s3utils";
import { useNavigate } from "react-router-dom";
import { Icon } from "@awsui/components-react";

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

  const [fileType, setFileType] = useState(SUPPORT_FILETYPES[0]);

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



  const submissionHandler = useCallback(async (increase) => {
    setFilesAreUploading(true);
    console.log("Submitting");
    console.log("Source", sourceLang);
    console.log("Target", targetLang);
    console.log("Files", selectedFiles);

    const randomElement = (Math.random() + 1).toString(36).substring(7);
    const today = (new Date()).toISOString().substring(0,10);
    const bucketKey = `${today}/${sourceLang.value}2${targetLang.value}-${randomElement}`;

    const uploadPromises = [];
    for (let idx in selectedFiles) {
      idx = parseInt(idx);
      console.log(idx, typeof(idx));
      console.log(selectedFiles[idx]);
      let file = selectedFiles[idx];
      const uploadPromise = await uploadFile(bucketKey, file)
      console.log("Uploaded", idx+1);
      setUploadedFilesCount(idx+1);
      uploadPromises.push(uploadPromise);
    }
    setUploadId(bucketKey);
    setFilesAreUploading(false);
  }, [selectedFiles, sourceLang, targetLang]);

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
                uploadId, 
                fileType.value,
                sourceLang.value, 
                targetLang.value, 
                uploadId
              ).then(response => {
                console.log(response);
                navigate(`/result/${response?.data?.response.JobId}`);
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
          <FormField label="File type" errorText={!targetLang && "Please select a value"}>
            <Select
              options={SUPPORT_FILETYPES}
              selectedOption={fileType}
              onChange={(event) => setFileType(event.detail.selectedOption)}
              selectedAriaLabel="selected"
            />
          </FormField>

          {!uploadId ? (
            <SpaceBetween>
              <FormField errorText={!targetLang && "Please select a value"}>
                <Button>
                    <label htmlFor="files" style={{cursor: "pointer", width: "100%", left: 0}}>
                        <div style={{width: "100%"}}>
                          <input 
                            id="files" 
                            name="files" 
                            type="file"
                            accept={fileType.value}
                            style={{display: "none"}} 
                            multiple 
                            onChange={selectHandler} />
                          <Icon name="upload" /> Select multiple files
                        </div>
                    </label>
                </Button>
                
                {selectedFiles.length > 0 ? (
                      <div>
                        <p>
                          {selectedFiles.length} files selected <span></span>
                          <Button iconName="close" onClick={() => setSelectedFiles([])}></Button>
                        </p>
                        {selectedFiles.length >= 0 && (
                          <Button disabled={filesAreUploading} variant="primary" onClick={() => submissionHandler()}>Upload</Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <p></p>
                      </>
                    )}
              </FormField>
            </SpaceBetween>
          ) : (
            <SpaceBetween>
              <FormField label="S3 input path">
                <Input disabled value={uploadId} />
              </FormField>
              <FormField>
                <Button iconName="close" onClick={() => resetUpload()}></Button>
              </FormField>
            </SpaceBetween>
          )}

          {!!filesAreUploading && (
            <>
              <StatusIndicator type="loading" />
              <ProgressBar 
                description={
                  `(${uploadedFilesCount}/${selectedFiles.length})` + 
                  ((uploadedFilesCount < selectedFiles.length) ? `Uploading ${selectedFiles[uploadedFilesCount].name}` : "")} 
                value={uploadedFilesCount / selectedFiles.length * 100}
              />
            </>
          )}
        </SpaceBetween>
      </Container>
    </Form>
  )
}

export default FileTranslationForm;