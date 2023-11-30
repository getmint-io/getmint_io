'use client';

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import Button from "../../../../components/ui/Button/Button";
import FormControl from "../../../../components/ui/FormControl/FormControl";
import UploadInput from "../../../../components/ui/UploadInput/UploadInput";
import Input from "../../../../components/ui/Input/Input";

import styles from './MintForm.module.css';

export interface MintFormData {
    file: string;
    name: string;
    description: string;
}

export interface MintSubmitEvent extends Omit<MintFormData, 'file'> {
    image: File;
}

interface MintFormProps {
    onSubmit: (data: MintSubmitEvent) => void;
}

export default function MintForm({ onSubmit }: MintFormProps) {
    const [file, setFile] = useState<File | null>(null);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MintFormData>({
        defaultValues: {
            file: '',
            name: '',
            description: '',
        },
    });

    const submit = (data: MintFormData) => {
        onSubmit({
            ...data,
            image: file!
        });
    };

    const setAutoGeneratedNameValue = () => {
        setValue('name', 'GENERATED');
    };

    const setAutoGeneratedDescriptionValue = () => {
        setValue('description', 'GENERATED');
    };

    return (
        <>
            <form onSubmit={handleSubmit(submit)}>
                <FormControl
                    title="Upload File"
                    extra="JPG, PNG, GIF, WEBM or SVG"
                    error={errors.file?.type === "required" ? 'Required field' : ''}
                >
                    <Controller
                        name="file"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <UploadInput
                                {...field}
                                onUpload={file => setFile(file)}
                                accept=".png, .jpeg, .jpg, .gif, .svg, .webm"
                            />
                        )}
                    />
                </FormControl>

                <FormControl
                    title="What shall we call the NFT?"
                    error={errors.name?.type === "required" ? 'Required field' : ''}
                >
                    <div className={styles.withExtra}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="text" placeholder="e.g. “Super Puper Ryan Gosling”" />
                            )}
                        />

                        <Button className={styles.generateButton} type="button" rounded small onClick={setAutoGeneratedNameValue}>
                            Auto-generate
                        </Button>
                    </div>
                </FormControl>

                <FormControl title="Description of your NFT" optional>
                    <div className={styles.withExtra}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) =>  (
                                <Input {...field} type="text" placeholder="e.g. “This NFT will give you the mood”" />
                            )}
                        />

                        <Button className={styles.generateButton} type="button" rounded small onClick={setAutoGeneratedDescriptionValue}>
                            Auto-generate
                        </Button>
                    </div>
                </FormControl>

                <Button type="submit" block>Get Mint</Button>
            </form>
        </>
    )
}