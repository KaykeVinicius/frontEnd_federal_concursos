"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { api, type ApiCity } from "@/lib/api"

interface CityComboboxProps {
  /** ID da cidade selecionada */
  value: number | null
  /** Chamado ao selecionar — retorna o objeto completo da cidade */
  onChange: (city: ApiCity | null) => void
  /** Filtra por estado (UF) quando ViaCEP já trouxe o estado */
  stateFilter?: string
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function CityCombobox({
  value,
  onChange,
  stateFilter,
  placeholder = "Buscar cidade...",
  inputClassName,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [cities, setCities] = useState<ApiCity[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState<ApiCity | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carrega cidade selecionada quando value chega de fora (ex: ViaCEP)
  useEffect(() => {
    if (value && !selectedCity) {
      api.cities.list({ q: String(value) }).catch(() => null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Busca cidades ao digitar (debounce 300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!open) return

    debounceRef.current = setTimeout(async () => {
      if (search.length < 2 && !stateFilter) {
        setCities([])
        return
      }
      setLoading(true)
      try {
        const result = await api.cities.list({
          q: search.length >= 2 ? search : undefined,
          state: stateFilter,
        })
        setCities(result)
      } catch {
        setCities([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, open, stateFilter])

  // Quando o popover abre com stateFilter, carrega de imediato
  useEffect(() => {
    if (open && stateFilter) {
      setLoading(true)
      api.cities.list({ state: stateFilter, q: search.length >= 2 ? search : undefined })
        .then(setCities)
        .catch(() => setCities([]))
        .finally(() => setLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stateFilter])

  function handleSelect(city: ApiCity) {
    setSelectedCity(city)
    onChange(city)
    setOpen(false)
  }

  function handleClear() {
    setSelectedCity(null)
    onChange(null)
    setSearch("")
  }

  // Permite que o componente pai injete a cidade selecionada (ex: após ViaCEP)
  // propagando via onChange que vem com o objeto completo
  const displayLabel = selectedCity
    ? `${selectedCity.name} — ${selectedCity.state}`
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal border-gray-200 focus:border-[#e8491d] transition-all duration-300",
            !displayLabel && "text-muted-foreground",
            inputClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-[#e8491d] shrink-0" />
            {displayLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite o nome da cidade..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            )}
            {!loading && cities.length === 0 && search.length < 2 && !stateFilter && (
              <CommandEmpty>Digite ao menos 2 letras para buscar.</CommandEmpty>
            )}
            {!loading && cities.length === 0 && (search.length >= 2 || stateFilter) && (
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            )}
            {!loading && cities.length > 0 && (
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={String(city.id)}
                    onSelect={() => handleSelect(city)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCity?.id === city.id ? "opacity-100 text-[#e8491d]" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{city.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{city.state}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        {selectedCity && (
          <div className="border-t p-2">
            <button
              type="button"
              onClick={handleClear}
              className="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
            >
              Limpar seleção
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
