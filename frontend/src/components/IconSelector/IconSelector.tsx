import { Button, Input, Popover, Stack, UnstyledButton } from "@mantine/core";
import {
  IconArmchair,
  IconBabyCarriage,
  IconBallFootball,
  IconBasket,
  IconBike,
  IconBook,
  IconBooks,
  IconBriefcase,
  IconBuildingBank,
  IconBuildingStore,
  IconBulb,
  IconBus,
  IconCactus,
  IconCake,
  IconCalculator,
  IconCalendar,
  IconCamera,
  IconCar,
  IconCat,
  IconChartBar,
  IconChartPie,
  IconClock,
  IconClothesRack,
  IconCloud,
  IconCoffee,
  IconCoin,
  IconCrown,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyPound,
  IconCurrencyYen,
  IconDeviceGamepad,
  IconDeviceLaptop,
  IconDeviceWatch,
  IconDog,
  IconDroplet,
  IconEye,
  IconFeather,
  IconFlower,
  IconFridge,
  IconGift,
  IconGlass,
  IconGlobe,
  IconHammer,
  IconHeart,
  IconHome,
  IconHospital,
  IconKeyboard,
  IconLamp,
  IconMail,
  IconMap,
  IconMessage,
  IconMicrophone,
  IconMusic,
  IconPalette,
  IconPaw,
  IconPencil,
  IconPhone,
  IconPlane,
  IconPlaneTilt,
  IconPlant,
  IconPlug,
  IconPool,
  IconPuzzle,
  IconReceipt,
  IconRocket,
  IconRun,
  IconScissors,
  IconShoppingCart,
  IconShovel,
  IconStar,
  IconStethoscope,
  IconSun,
  IconSwimming,
  IconTarget,
  IconTeapot,
  IconTent,
  IconTool,
  IconTrekking,
  IconTrophy,
  IconTruck,
  IconUmbrella,
  IconUser,
  IconUsers,
  IconVaccineBottle,
  IconWallet,
  IconWeight,
  IconWind,
  IconWorld,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ICONS = [
  { name: "wallet", Icon: IconWallet },
  { name: "home", Icon: IconHome },
  { name: "car", Icon: IconCar },
  { name: "shopping-cart", Icon: IconShoppingCart },
  { name: "basket", Icon: IconBasket },
  { name: "receipt", Icon: IconReceipt },
  { name: "building-bank", Icon: IconBuildingBank },
  { name: "building-store", Icon: IconBuildingStore },
  { name: "coin", Icon: IconCoin },
  { name: "calculator", Icon: IconCalculator },
  { name: "chart-bar", Icon: IconChartBar },
  { name: "chart-pie", Icon: IconChartPie },
  { name: "target", Icon: IconTarget },
  { name: "briefcase", Icon: IconBriefcase },
  { name: "droplet", Icon: IconDroplet },
  { name: "coffee", Icon: IconCoffee },
  { name: "glass", Icon: IconGlass },
  { name: "cake", Icon: IconCake },
  { name: "gift", Icon: IconGift },
  { name: "heart", Icon: IconHeart },
  { name: "star", Icon: IconStar },
  { name: "crown", Icon: IconCrown },
  { name: "trophy", Icon: IconTrophy },
  { name: "rocket", Icon: IconRocket },
  { name: "plane", Icon: IconPlane },
  { name: "plane-tilt", Icon: IconPlaneTilt },
  { name: "truck", Icon: IconTruck },
  { name: "bus", Icon: IconBus },
  { name: "bike", Icon: IconBike },
  { name: "run", Icon: IconRun },
  { name: "trekking", Icon: IconTrekking },
  { name: "swimming", Icon: IconSwimming },
  { name: "pool", Icon: IconPool },
  { name: "tent", Icon: IconTent },
  { name: "plant", Icon: IconPlant },
  { name: "flower", Icon: IconFlower },
  { name: "cactus", Icon: IconCactus },
  { name: "teapot", Icon: IconTeapot },
  { name: "lamp", Icon: IconLamp },
  { name: "bulb", Icon: IconBulb },
  { name: "tool", Icon: IconTool },
  { name: "hammer", Icon: IconHammer },
  { name: "shovel", Icon: IconShovel },
  { name: "scissors", Icon: IconScissors },
  { name: "pencil", Icon: IconPencil },
  { name: "book", Icon: IconBook },
  { name: "books", Icon: IconBooks },
  { name: "music", Icon: IconMusic },
  { name: "guitar", Icon: IconMusic },
  { name: "camera", Icon: IconCamera },
  { name: "phone", Icon: IconPhone },
  { name: "laptop", Icon: IconDeviceLaptop },
  { name: "keyboard", Icon: IconKeyboard },
  { name: "watch", Icon: IconDeviceWatch },
  { name: "clothes-rack", Icon: IconClothesRack },
  { name: "armchair", Icon: IconArmchair },
  { name: "fridge", Icon: IconFridge },
  { name: "plug", Icon: IconPlug },
  { name: "hospital", Icon: IconHospital },
  { name: "vaccine", Icon: IconVaccineBottle },
  { name: "stethoscope", Icon: IconStethoscope },
  { name: "weight", Icon: IconWeight },
  { name: "baby-carriage", Icon: IconBabyCarriage },
  { name: "dog", Icon: IconDog },
  { name: "cat", Icon: IconCat },
  { name: "paw", Icon: IconPaw },
  { name: "globe", Icon: IconGlobe },
  { name: "world", Icon: IconWorld },
  { name: "map", Icon: IconMap },
  { name: "cloud", Icon: IconCloud },
  { name: "sun", Icon: IconSun },
  { name: "wind", Icon: IconWind },
  { name: "umbrella", Icon: IconUmbrella },
  { name: "calendar", Icon: IconCalendar },
  { name: "clock", Icon: IconClock },
  { name: "mail", Icon: IconMail },
  { name: "message", Icon: IconMessage },
  { name: "user", Icon: IconUser },
  { name: "users", Icon: IconUsers },
  { name: "eye", Icon: IconEye },
  { name: "puzzle", Icon: IconPuzzle },
  { name: "gamepad", Icon: IconDeviceGamepad },
  { name: "football", Icon: IconBallFootball },
  { name: "microphone", Icon: IconMicrophone },
  { name: "palette", Icon: IconPalette },
  { name: "feather", Icon: IconFeather },
];

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return ICONS;
    const q = search.toLowerCase();
    return ICONS.filter((ic) => ic.name.includes(q));
  }, [search]);

  const SelectedIcon = ICONS.find((ic) => ic.name === value)?.Icon ?? IconWallet;

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      width={360}
      position="bottom"
      shadow="md"
    >
      <Popover.Target>
        <Button
          variant="default"
          leftSection={<SelectedIcon size={18} />}
          onClick={() => setOpened((v) => !v)}
        >
          {value}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap={4}>
          <Input
            placeholder="Search icons…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="xs"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: 4,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {filtered.map(({ name, Icon }) => {
              const selected = value === name;
              return (
                <UnstyledButton
                  key={name}
                  onClick={() => {
                    onChange(name);
                    setOpened(false);
                  }}
                  data-selected={selected || undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    borderRadius: 6,
                    background: selected ? "var(--mantine-color-teal-outline)" : "transparent",
                    border: selected
                      ? "2px solid var(--mantine-color-teal-filled)"
                      : "1px solid transparent",
                  }}
                >
                  <Icon size={22} />
                </UnstyledButton>
              );
            })}
          </div>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
