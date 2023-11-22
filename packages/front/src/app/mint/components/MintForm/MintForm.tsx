'use client';

import { useForm, Controller } from "react-hook-form";

import Button from "../../../../components/ui/Button/Button";
import FormControl from "../../../../components/ui/FormControl/FormControl";
import Input from "../../../../components/ui/Input/Input";

import styles from './MintForm.module.css';
import UploadInput from "../../../../components/ui/UploadInput/UploadInput";

interface FormData {
    file: File | null;
    name: string;
    description: string;
}

export default function MintForm() {
    const { control, handleSubmit, setValue } = useForm<FormData>({
        defaultValues: {
            file: null,
            name: '',
            description: '',
        },
    });

    const setAutoGeneratedNameValue = () => {
        setValue('name', 'GENERATED');
    };

    const setAutoGeneratedDescriptionValue = () => {
        setValue('description', 'GENERATED');
    };

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl title="Upload File" extra="JPG, PNG, GIF, WEBM or SVG">
                    <Controller
                        name="file"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <UploadInput {...field} accept=".png, .jpeg, .jpg, .gif, .svg, .webm" />
                        )}
                    />
                </FormControl>

                <FormControl title="What shall we call the NFT?">
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
                            rules={{ required: true }}
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