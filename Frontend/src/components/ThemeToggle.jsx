import { useTheme } from "../hooks/useTheme";
import { Switch } from "antd";
import { SunFilled, MoonFilled } from "@ant-design/icons";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      <Switch
        checked={theme === "dark"}
        onChange={toggleTheme}
        checkedChildren={<MoonFilled className="w-5 h-5 text-white" />}
        unCheckedChildren={<SunFilled className="w-5 h-5 text-yellow-500" />}
        className="bg-gray-200 dark:bg-gray-700"
      />
    </div>
  );
};

export default ThemeToggle;