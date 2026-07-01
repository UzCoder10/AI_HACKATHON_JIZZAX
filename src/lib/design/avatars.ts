/** Nihol dizaynidagi 3D avatar URLlari */
export const FIGURE_AVATARS: Record<string, string> = {
  "al-xorazmiy":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAEt77LqAJbVo9TMdKFoMxt-YhGtmNM_IOr8A-QwNzNLAeWsRGdAoYRkf8AmM3UDo_TyPhezzFz67eAUfoIPAKUuBoVvX7FG___T6Xg9KkeLPNNFYfZfu92MIVkHB6vVpkuqna2TVOvnFO6LKmA6kn42xcnGhZ9XolAlqWDOvEC9Oy044V5IoU4_x5ydzmPkOpe_xAbDmAKCh5seVCeQyo6-eBiSQd47FzR7kK4s0cEwRxqkHv0mUhDTsFxKbpCRZshPhzaPK7dqva1",
  "ibn-sino":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDBun_zwB_NS8lkpuFpNxl1MOOSF3lvbCLTRvRB9VIWbj4Mz1p9WqwZT7WkImQlLgPF-Eilub9Ff2W81WEg5S-r_c8CGX5eFCd8bIT3zswa21vZ4LV6_hgAbAYkBZDTeR3Pj0kKHBokwoB1_VmjL3YkKnL3Z0F26cDq3YUrdiX-HGZhIFNBdeTpKVkKY5OfB2ZKQ6hJ8yxPxdNKoXhnDdE354cZbnZwKTl_wCaQwV8iEclpePFN8y0EHqxYFyRvo2JCABuJHmzmLW_d",
  "mirzo-ulugbek":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAtceBbSW-kjoX8ZgNcNQi2UHkDRqx3gHJF32kzhKlDVWSSWP34GzNj_JfQplW0X8FiDooGobjLK0N_5abG9KV_4iA_TKCdFTE-7NEyu2huH0Xmhm1BItrIaG6l3MUiCaHNnrEciO76j50OG0l1Z7YuF73ncf_5rKuGrrz7PKToz92gMjJqcZDnrlHan6QwDykI4l9j1JlQXOWb5F-DEU8AzeAJeKj_k1mZraCbzUcnwv5Shn4TWrvix--HXJG51_cMYO-kUfmFkQlM",
  "abu-rayhon-beruniy":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCq111uLnS4UdT_Jq4B_jWCFY57eNP-ESowa-w7jhkpXJg848r3ABiC4_oI6nQoTGoO-qowZ2lsK7PJC0myIVAWPkZK9i2DV84LE437YqlY4lhdFr5FEeChjeIoSzT8XBjN8hi0PPyxnLWbqPDdcUlbg6sd2-voUHMddP-sRmvcUhJ0vQ5nyCQ9W2JX-v1hFDdZXlcNOe7fJPfvLV9MaAQeBhZHKVYj74TcLOyb7wJgbTpHtX7lktTXC2e2WMoWPbkxfn0rAM7L8U8h",
  "alisher-navoiy":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDEk5uaQ4KGBK6lF3ly-1NDuGFj_xYgMaKjxYTjMFJFmmrijzTps5dVmO8SrpGvwfUagRqQK_War5O8_GsM7nIT5FqhFlJev1o5pusT35_Xfoh5ewfn4WpBj9xxNTGZa9IKtZmjB04YjqlOTBgfpXFPJVp_EtQhwJ_xAItG2j5_KoVp74OPygFR8XAdTy3ITN2DPbGy1ZOrYuLSAJgzwGDQoEVVoElpUJTuC7l2hP7lIEv0_d1Bv6LUs6keNm2GWGXRTsfxcpsAMtiC",
};

export const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBNjxgfylc6qO-3wrlYKNpUwoH-8csii0JVyPjzxDgZRQw7SuA9Z7VlJJ3xq4-vlxoMlCo4_OwQOMDzrfQT2PyHA9uE8p0JGdqoulkOWtjh-Q7S-Hc7RsSd4hlwv4bveAys2gdpajJXoaWeel0r-SAn_sWXjmGEedokOQhI48IG6WE7WbITUBAuF9LPT0ZgfF_B3TwXgHavriFjddBW1ZgRr7EjPQimAqhmT1_tEjP0NFKY3J5lkxW7T3gORlopvKfd8MSpHqrpx4C_";

export const HERO_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCq111uLnS4UdT_Jq4B_jWCFY57eNP-ESowa-w7jhkpXJg848r3ABiC4_oI6nQoTGoO-qowZ2lsK7PJC0myIVAWPkZK9i2DV84LE437YqlY4lhdFr5FEeChjeIoSzT8XBjN8hi0PPyxnLWbqPDdcUlbg6sd2-voUHMddP-sRmvcUhJ0vQ5nyCQ9W2JX-v1hFDdZXlcNOe7fJPfvLV9MaAQeBhZHKVYj74TcLOyb7wJgbTpHtX7lktTXC2e2WMoWPbkxfn0rAM7L8U8h";

export function getFigureAvatar(slug: string): string | undefined {
  return FIGURE_AVATARS[slug];
}

/** Mentor kartasi uchun rang accent */
export function getFigureAccent(slug: string): {
  bar: string;
  shadow: string;
  badge: string;
} {
  if (slug === "al-xorazmiy") {
    return { bar: "bg-primary", shadow: "shadow-vibrant-primary", badge: "text-primary" };
  }
  if (slug === "ibn-sino") {
    return { bar: "bg-accent-red", shadow: "shadow-vibrant-red", badge: "text-accent-red" };
  }
  if (slug === "mirzo-ulugbek") {
    return { bar: "bg-secondary-container", shadow: "shadow-vibrant-secondary", badge: "text-secondary" };
  }
  return { bar: "bg-tertiary-fixed-dim", shadow: "shadow-vibrant-tertiary", badge: "text-tertiary" };
}
