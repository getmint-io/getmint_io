import Image from "next/image";
import styles from './Footer.module.css';

function FooterLink({ href, children }) {
    return (
        <a href={href} target="_blank" className={styles.link}>
            {children}
        </a>
    );
}

export default function Footer() {
    return (
        <div className={styles.footer}>
            <div className={styles.socials}>
                <FooterLink href="#">
                    <Image src="/svg/socials/discord.svg" width={32} height={32} alt="Discord" />
                    <span>Discord</span>
                </FooterLink>

                <FooterLink href="#">
                    <Image src="/svg/socials/twitter.svg" width={28} height={28} alt="Twitter" />
                    <span>Twitter</span>
                </FooterLink>
            </div>

            <FooterLink href="#">
                <span className={styles.poweredBy}>Powered by</span>
                <Image src="/svg/layer-zero.svg" width={111} height={30} alt="Layer Zero" />
            </FooterLink>
        </div>
    )
}