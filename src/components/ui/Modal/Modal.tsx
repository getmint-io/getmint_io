import { Flex, Modal } from "antd";
import { ReactNode } from "react";
import styles from "./Modal.module.css";

interface Props {
    children: ReactNode;
    open?: boolean;
    title?: ReactNode;
    footer?: ReactNode;
    width?: string | number;
    onClose?(): void;
}

export default function UiModal({ open, children, title, footer, width, onClose }: Props) {
    return (
        <Modal
            open={open}
            centered
            closeIcon={false}
            title={null}
            footer={null}
            width={width || "auto"}
            className={styles.modal}
            classNames={{
                content: styles.modalContent,
                mask: styles.modalMask,
            }}
            onCancel={onClose}
        >
            <div className={styles.body}>
                <Flex gap={8} align="center" justify="flex-end" className={styles.header}>
                    <div className={styles.title}>
                        {title}
                    </div>
                    <img src="/svg/ui/close.svg" className={styles.close} onClick={onClose} />
                </Flex>
                <div className={styles.content}>
                    {children}
                </div>
            </div>

            {footer && (
                <div className={styles.footer}>
                    {footer}
                </div>
            )}
        </Modal>
    )
}