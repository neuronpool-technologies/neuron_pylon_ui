import { useState } from "react";
import { Input, Spinner } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { BiSearch } from "react-icons/bi";
import { search } from "@/client/commands";
import { useActors } from "@/hooks/useActors";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { actors } = useActors();
  const navigate = useNavigate();

  const searchVectors = async () => {
    setSearching(true);
    try {
      const finalQuery = await search({
        pylon: actors.neuronPylon,
        query: searchQuery,
      });

      navigate(finalQuery);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(String(error));
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <Field disabled={searching} invalid={errorMsg !== ""} errorText={errorMsg}>
      <InputGroup
        w="100%"
        startElement={searching ? <Spinner size="xs" /> : <BiSearch />}
      >
        <Input
          placeholder="Search (e.g., Vector, Controller, ...)"
          onKeyDown={(e) => (e.key === "Enter" ? searchVectors() : null)}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          bg={errorMsg ? "bg.error" : "bg.muted"}
          size="lg"
        />
      </InputGroup>
    </Field>
  );
};

export default Search;
