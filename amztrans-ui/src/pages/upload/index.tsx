import React from "react";
import FileTranslationForm from "../../components/FileTranslationForm";
import DefaultAppLayout from "../Layout";

const UploadPage = () => {
    return (
        <DefaultAppLayout
            content={
                FileTranslationForm()
            }
        />
    )
}
export default UploadPage;
