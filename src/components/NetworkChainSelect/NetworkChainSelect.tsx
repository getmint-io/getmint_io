import { Dropdown, Flex, MenuProps, message } from "antd";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { getChainLogo } from "../../utils/getChainLogo";

import styles from "./NetworkChainSelect.module.css";

export default function NetworkChainSelect() {
    const [messageApi, contextHolder] = message.useMessage();
    const { chain, chains } = useNetwork();
    const { reset, switchNetwork, error } = useSwitchNetwork(
        {
            onSettled: () => {
                reset();
            },
        }
    );

    const chainsMenu = useMemo(() => {
        const items: MenuProps['items'] = [...chains]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(c => ({
                key: c.id,
                label: c.name
            }));

        return items;
    }, [chains]);

    const chainLogo = useMemo(() => getChainLogo(chain?.network!), [chain]);

    const handleSwitchNetwork = (chainId: number) => {
        if (switchNetwork) {
            switchNetwork(chainId);
        }
    };

    useEffect(() => {
        if (error) {
            void messageApi.warning('User rejected the request');
        }
    }, [error, messageApi]);

    if (!chain || !switchNetwork) {
        return null;
    }

    return (
        <>
            {contextHolder}

            <Dropdown
                trigger={['click']}
                menu={{
                    items: chainsMenu,
                    selectable: true,
                    defaultSelectedKeys: [String(chain.id)],
                    onClick: ({ key }) => handleSwitchNetwork(parseInt(key))
                }}
            >
                <Flex align="center" gap={8} className={styles.dropdown}>
                    {chainLogo && <Image src={chainLogo} width={24} height={24} alt="" />}

                    <div className={styles.value}>{chain.name}</div>

                    <Image src="/svg/ui/dropdown-arrow.svg" width={24} height={24} alt="" />
                </Flex>
            </Dropdown>
        </>
    )
}