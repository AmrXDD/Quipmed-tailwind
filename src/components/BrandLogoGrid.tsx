import type { Brand } from "@/lib/types";

type BrandLike = Pick<Brand, "id" | "name" | "logo_url" | "website" | "website_link">;

const BRAND_WEBSITE_BY_NAME: Record<string, string> = {
  "neusoft medical systems": "https://www.neusoftmedical.com",
  "allengers": "https://www.allengers.com",
  "edan": "https://www.edan.com",
  "nitrocare": "https://www.nitrocare.com.tr",
  "gram bioline": "https://gram-bioline.com",
  "ems swiss": "https://www.ems-swissquality.com",
  "led spa": "https://www.led.it",
  "cureosity": "https://cureosity.de",
  "roam technology": "https://www.roamtechnology.com",
  "alfred becht": "https://www.alfredbecht.de",
  "tuttnauer": "https://tuttnauer.com",
  "aohua endoscopy": "https://www.aohua-endoscopy.com",
  "nouvag": "https://nouvag.com",
  "mectron": "https://medical.mectron.com",
  "limmer laser": "https://limmerlaser.de",
  "ig medical": "https://www.ig-medical.com",
  "mnt medikal": "https://www.mntmedikal.com.tr",
  "mediworks": "https://www.mediworks.biz",
  "baldus medizintechnik": "https://baldus-sedation.com",
  "ams advanced medtech": "https://www.amsltd.com",
  "wellgo medical": "https://www.wellgo.de",
  "intelligo": "https://www.intelligofree.com",
  "chrisofix": "https://chrisofix.com",
  "ovik health": "https://ovikhealth.com",
  "chest m.i.": "https://www.chest-mi.co.jp",
  "medmay": "https://www.med-may.com",
};

/**
 * Per-brand logo overrides — high-quality logo URLs (Wikimedia / official
 * media kits / known CDN paths). Used before the Clearbit fallback so we
 * don't depend on Clearbit returning the highest-resolution asset.
 */
const BRAND_LOGO_OVERRIDES: Record<string, string> = {
  "neusoft medical systems":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Neusoft_logo.svg/2560px-Neusoft_logo.svg.png",
  "allengers":
    "https://www.allengers.com/wp-content/uploads/2021/12/Allengers-logo.png",
  "edan":
    "https://www.edan.com/Public/uploads/image/20210226/1614319593603975.png",
  "tuttnauer":
    "https://tuttnauer.com/sites/default/files/tuttnauer-logo.svg",
  "ems swiss":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/EMS_Electro_Medical_Systems_logo.svg/2560px-EMS_Electro_Medical_Systems_logo.svg.png",
  "mectron":
    "https://medical.mectron.com/wp-content/themes/mectron-medical/assets/img/logo-mectron.svg",
  "nouvag":
    "https://nouvag.com/wp-content/themes/nouvag/img/logo.svg",
  "cureosity":
    "https://cureosity.de/wp-content/uploads/2021/05/CUREO_Logo_RGB.svg",
  "intelligo":
    "https://www.intelligofree.com/wp-content/uploads/2022/03/IntelliGO_Logo.png",
  "chrisofix":
    "https://chrisofix.com/wp-content/uploads/2021/04/chrisofix-logo.svg",
  "limmer laser":
    "https://limmerlaser.de/wp-content/uploads/2021/02/limmerLaserLogo.svg",
  "ovik health":
    "https://ovikhealth.com/wp-content/uploads/2022/06/OVIK-Health-Logo.png",
  "chest m.i.":
    "https://www.chest-mi.co.jp/img/common/logo.svg",
  "led spa":
    "https://www.led.it/wp-content/uploads/2020/03/logo-led-medical.svg",
  "alfred becht":
    "https://www.alfredbecht.de/typo3conf/ext/becht_template/Resources/Public/Images/becht-logo.svg",
  "roam technology":
    "https://www.roamtechnology.com/themes/custom/roam/logo.svg",
  "aohua endoscopy":
    "https://www.aohua-endoscopy.com/static/images/logo.png",
  "nitrocare":
    "https://www.nitrocare.com.tr/wp-content/uploads/2020/03/nitrocare-logo.png",
  "mnt medikal":
    "https://www.mntmedikal.com.tr/wp-content/uploads/2021/04/mnt-logo.png",
  "ams advanced medtech":
    "https://www.amsltd.com/wp-content/uploads/2020/06/ams-logo.png",
  "ig medical":
    "https://www.ig-medical.com/themes/custom/ig/logo.svg",
  "mediworks":
    "https://www.mediworks.biz/static/images/logo.png",
  "baldus medizintechnik":
    "https://baldus-sedation.com/wp-content/uploads/2020/02/baldus-logo.svg",
  "wellgo medical":
    "https://www.wellgo.de/wp-content/uploads/2019/04/wellgo-logo.svg",
  "gram bioline":
    "https://gram-bioline.com/app/themes/gram-bioline/dist/img/logo.svg",
  "medmay":
    "https://www.med-may.com/static/images/logo.png",
};

export function brandWebsite(b: BrandLike): string | null {
  const raw =
    b.website_link || b.website || BRAND_WEBSITE_BY_NAME[b.name.toLowerCase()];
  if (!raw) return null;
  try {
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

export function brandLogoSrc(b: BrandLike, site: string | null): string | null {
  if (b.logo_url) return b.logo_url;
  const override = BRAND_LOGO_OVERRIDES[b.name.toLowerCase()];
  if (override) return override;
  if (!site) return null;
  try {
    const host = new URL(site).hostname.replace(/^www\./, "");
    return `https://logo.clearbit.com/${host}`;
  } catch {
    return null;
  }
}

export default function BrandLogoGrid({ brands }: { brands: BrandLike[] }) {
  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-slate-mid">
        No brand partners listed yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {brands.map((b) => {
        const site = brandWebsite(b);
        const logo = brandLogoSrc(b, site);
        const href = site ?? `/products?brand=${b.id}`;
        const external = Boolean(site);
        return (
          <a
            key={b.id}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            title={`Visit ${b.name}`}
            className="group relative flex h-32 items-center justify-center rounded-xl border border-white/10 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-mint-soft/60 hover:shadow-lg"
          >
            {logo ? (
              <img
                src={logo}
                alt={b.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  const stage = img.dataset.fallback ?? "0";
                  if (stage === "0" && site) {
                    try {
                      const host = new URL(site).hostname.replace(/^www\./, "");
                      img.dataset.fallback = "1";
                      img.src = `https://logo.clearbit.com/${host}`;
                      return;
                    } catch {
                      /* fall through */
                    }
                  }
                  if (stage !== "2" && site) {
                    try {
                      img.dataset.fallback = "2";
                      img.src = `https://www.google.com/s2/favicons?domain=${new URL(site).hostname}&sz=128`;
                      return;
                    } catch {
                      /* fall through */
                    }
                  }
                  img.style.display = "none";
                  const sib = img.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = "flex";
                }}
                className="block h-16 max-h-16 w-full max-w-[150px] object-contain opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : null}
            <span
              style={{ display: logo ? "none" : "flex" }}
              className="items-center justify-center text-sm font-semibold text-navy-900"
            >
              {b.name}
            </span>
          </a>
        );
      })}
    </div>
  );
}
