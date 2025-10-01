import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";

interface SearchFilters {
  query: string;
  level?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  tags: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  sources: string[];
}

const AdvancedSearch = ({ onSearch, sources }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleSearch = () => {
    onSearch(filters);
  };

  const addTag = () => {
    if (tagInput && !filters.tags.includes(tagInput)) {
      setFilters({ ...filters, tags: [...filters.tags, tagInput] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFilters({ ...filters, tags: filters.tags.filter(t => t !== tag) });
  };

  const clearFilters = () => {
    setFilters({ query: "", tags: [] });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Advanced Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs (supports regex)..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Log Level</label>
            <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <Select value={filters.source} onValueChange={(value) => setFilters({ ...filters, source: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">IP Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by IP..."
                value={filters.ipAddress || ""}
                onChange={(e) => setFilters({ ...filters, ipAddress: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => setFilters({ ...filters, startDate: date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => setFilters({ ...filters, endDate: date })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <Button onClick={addTag} variant="outline">Add</Button>
          </div>
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;