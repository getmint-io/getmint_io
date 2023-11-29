import { ReactNode } from "react";
import Image from "next/image";
import { useConnect } from "wagmi";

import Button from "../../ui/Button/Button";
import styles from './ConnectWallet.module.css';
import AppStore from "../../../store/AppStore";

const ConnectorIcon: Record<string, ReactNode> = {
    'MetaMask': <Image src="/svg/metamask.svg" width={32} height={32} alt="MetaMask" />
}

export default function ConnectWallet() {
    const { closeAccountDrawer } = AppStore;

    const { connect, connectors, isLoading, pendingConnector } =
        useConnect({
            onSuccess: closeAccountDrawer
        });

    return (
        <div className={styles.wrapper}>
            <div>
                <h2 className={styles.title}>Connect a Wallet</h2>

                {connectors.map((connector) => (
                    <Button
                        disabled={!connector.ready}
                        key={connector.id}
                        className={styles.connectorBtn}
                        onClick={() => connect({ connector })}
                        block
                    >
                        {ConnectorIcon[connector.name]}
                        {connector.name}
                        {!connector.ready && ' (unsupported)'}
                        {isLoading &&
                            connector.id === pendingConnector?.id &&
                            ' (connecting)'}
                    </Button>
                ))}
            </div>
        </div>
    )
}