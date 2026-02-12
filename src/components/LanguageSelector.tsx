import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLanguage, supportedLanguages, type LanguageCode } from "@/store/languageSlice";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);
  
  const currentLang = supportedLanguages.find(l => l.code === currentLanguage);

  const handleLanguageChange = (code: LanguageCode) => {
    dispatch(setLanguage(code));
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <Globe className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 text-xs">
                {currentLang?.flag}
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Language: {currentLang?.name}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <ScrollArea className="h-80">
          {supportedLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
