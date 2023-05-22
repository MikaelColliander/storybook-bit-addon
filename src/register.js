import React, { useEffect, useState } from "react";
import { addons, types } from "@storybook/addons";
import {
  AddonPanel,
  Title,
  DocsWrapper,
  DocsContent,
  Preview,
  Form,
  TabsState,
  H2,
  Source,
} from "@storybook/components";
import { useParameter } from "@storybook/api";
import untar from "js-untar";

const PARAM_KEY = "bit";

const Bit = () => {
  const value = useParameter(PARAM_KEY, null);

  const [versions, setVersions] = useState(["Loading versions..."]);

  const [selectedVersion, setSelectedVersion] = useState("");

  const [files, updateFiles] = useState([]);

  const [data, setData] = useState(null);

  const item = value ? value.componentId : "";

  const url = value ? value.apiUrl : "";

  const componentId = item?.includes("/") ? item.replace("/", ".") : item;

  useEffect(() => {
    if (item) {
      setSelectedVersion("");
      setVersions(["Loading versions..."])
      fetch(`${url}component/${componentId}`).then((result) =>
        result.json().then((data) => {
          const fetchedVersions = Object.keys(data.versions);
          setVersions(fetchedVersions);
          setData(data);
          handleVersionChange(fetchedVersions[0]);
        })
      );
    }
  }, [componentId]);

  if (!item) {
    return false;
  }

  const getFiles = (ver) => {
    updateFiles((arr) => (arr = []));
    fetch(`${url}/tarball/${componentId}/${ver}`)
      .then((res) => res.arrayBuffer())
      .then((arr) => arr)
      .then(untar)
      .then((tarBallFiles) => {
        Object.values(tarBallFiles)
          .filter(
            (file) =>
              !file.name.includes("package/dist") &&
              !file.name.includes("package.json") &&
              !file.name.includes("tsconfig.json") &&
              !file.name.includes(".d.ts") &&
              !file.name.includes("package/preview-")
          )
          .map((file) => {
            file.blob.text().then((text) => {
              updateFiles((arr) => [
                ...arr,
                {
                  title: file.name.replace("package/", ""),
                  content: text.toString(),
                },
              ]);
            });
          });
      });
  };

  const content = Object.entries(files).map(([k, v]) => (
    <div key={k} id={k} title={v.title}>
      <Source
        title={v.title}
        code={v.content}
        dark
        language="tsx"
        state="open"
      />
    </div>
  ));

  const getDeps = (type) => {
    const comp = data.versions[selectedVersion];
    if (!comp) return [];
    return Object.entries(data.versions[selectedVersion][type]).map(([k, v]) => (
      <span key={k}>
        {k}@{v}
      </span>
    ));
  }

  const handleVersionChange = (e) => {
    let ver;
    if (e.target) {
      setSelectedVersion(versions[e.target.value]);
      ver = versions[e.target.value];
    } else {
      setSelectedVersion(e);
      ver = e;
    }
    getFiles(ver);
  };

  return (
    <DocsWrapper>
      <DocsContent>
        <Title style={{ marginBottom: "24px" }}>{item}</Title>
        <H2 style={{ fontWeight: "bold" }}>Versions</H2>
        <Preview>
          <div>
            <Form.Select onChange={(e) => handleVersionChange(e)}>
              {versions.map((version, index) => (
                <option key={version} value={index}>
                  {version}
                </option>
              ))}
            </Form.Select>
            <Source
              code={`npm i @sj-ab/component-library.${item.replace(
                "/",
                "."
              )}@${selectedVersion}`}
              language="sh"
              dark
            />
          </div>
        </Preview>
        <H2 style={{ fontWeight: "bold" }}>Source code</H2>
        <Preview>{files.length > 0 && <TabsState>{content}</TabsState>}</Preview>
        {selectedVersion && (
          <>
            <H2 style={{ fontWeight: "bold" }}>Dependencies</H2>
            <Preview>{getDeps("dependencies")}</Preview>
            <H2 style={{ fontWeight: "bold" }}>Dev dependencies</H2>
            <Preview>{getDeps("devDependencies")}</Preview>
            <H2 style={{ fontWeight: "bold" }}>Peer dependencies</H2>
            <Preview>{getDeps("peerDependencies")}</Preview>
          </>
        )}
      </DocsContent>
    </DocsWrapper>
  );
};

const ADDON_ID = "bit";

const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.TAB,
    route: ({ storyId, refId }) =>
      refId ? `/changelog/${refId}_${storyId}` : `/changelog/${storyId}`,
    match: ({ viewMode }) => viewMode === "changelog",
    title: "Bit Versions",
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key}>
        <Bit />
      </AddonPanel>
    ),
  });
});
