// @flow
/* eslint-env browser */

import React from 'react';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';
import { Button } from './editor-modal.js';
import type { ImportData } from './lib/importer.js';
import { parseImport } from './lib/importer.js';

const ImportComponentContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 0.3rem;
  outline: 0;
`;

const ImportContent = styled.div`
  width: auto;
  height: auto;
`;

const ImportSelect = styled.div`
  display: flex;
  padding: 0.75rem 0.75rem 0rem 0.75rem;
`;

const ImportArea = styled.div`
  box-sizing: border-box;
  display: block;
  width: auto;
  height: auto;
  min-height: 300px;
  padding: 0rem 1rem;
`;

const ImportTextArea = styled.textarea`
  padding: 0px;
  width: 100%;
  resize: vertical;
  min-height: 250px;
  max-height: 450px;
  border: 1px solid rgb(206, 212, 218);
  border-radius: 0.3rem;
  font-family: -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 1rem;
  font-weight: 400;
`;

const ImportDropArea = styled.div`
  padding: 0px;
  width: 100%;
  min-height: 250px;
  height: 100%;
  border: 1px solid rgb(206, 212, 218);
  border-radius: 0.3rem;
  fontfamily: -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans' sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  font-size: 1rem;
  font-weight: 400;
`;

const ImportInfo = styled.div`
  display: block;
  padding: 0rem 1rem;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 0.75rem;
  border-top: 1px solid rgb(222, 226, 230);
`;

export type ImportComponentProps = {
  onImport: any => mixed,
  onCancel: () => mixed
};

export function ImportComponent(props: ImportComponentProps) {
  const [isImportText, setIsImportText] = React.useState(true);
  const [text, setText] = React.useState('');
  const [importFile, setImportFile] = React.useState<File | null>(null);

  const [parseResult, setParseResult] = React.useState<ImportData>({
    valid: false,
    validationErrors: []
  });

  React.useEffect(
    () => {
      async function parseData() {
        if (isImportText) {
          setParseResult(await parseImport(text));
        } else if (importFile !== null) {
          setParseResult(await parseImport(importFile));
        }
      }
      parseData();
    },
    [isImportText, text, importFile]
  );

  function flush() {
    setImportFile(null);
    setText('');
    props.onCancel();
  }

  function isDataSet() {
    return (isImportText && text) || (!isImportText && importFile);
  }

  return (
    <ImportComponentContent>
      <ImportContent>
        <ImportSelect>
          <Button
            style={{
              backgroundColor: isImportText ? 'rgb(0, 105, 217)' : 'rgb(90, 98, 94)'
            }}
            onClick={() => {
              setIsImportText(true);
            }}
          >
            Import From Text
          </Button>
          <Button
            style={{
              backgroundColor: isImportText ? 'rgb(90, 98, 94)' : 'rgb(0, 105, 217)'
            }}
            onClick={() => {
              setIsImportText(false);
            }}
          >
            Import From File
          </Button>
        </ImportSelect>
        <ImportArea>
          {isImportText && (
            <ImportTextArea
              style={isDataSet() && !parseResult.valid ? { borderColor: 'rgb(220, 53, 69)' } : {}}
              onChange={event => setText(event.target.value)}
              value={text}
            />
          )}
          {!isImportText && (
            <Dropzone onDrop={importFiles => setImportFile(importFiles[0])}>
              {({ getRootProps, getInputProps }) => (
                <ImportDropArea
                  style={
                    isDataSet() && !parseResult.valid ? { borderColor: 'rgb(220, 53, 69)' } : {}
                  }
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  {importFile ? (
                    <p>
                      {!parseResult.valid ? 'Invalid' : ''} Selected File: {importFile.name}.<br />
                      Drag 'n' drop or click again to change the file.
                    </p>
                  ) : (
                    <p>Drag 'n' drop your file here, or click to select a file.</p>
                  )}
                </ImportDropArea>
              )}
            </Dropzone>
          )}
          <ImportInfo style={{ color: 'rgb(133, 100, 4)', backgroundColor: 'rgb(255, 243, 205)' }}>
            {isDataSet() &&
              !parseResult.valid &&
              parseResult.validationErrors.map((err, i) => <div>{err}</div>)}
          </ImportInfo>
        </ImportArea>
        <ImportInfo>
          Supported formats:
          <ul style={{ marginTop: '0' }}>
            <li>
              <a
                href="https://tools.ietf.org/html/rfc7946"
                target="_blank"
                rel="noopener noreferrer"
                title="GeoJSON Specification"
              >
                GeoJSON
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/kml/"
                target="_blank"
                rel="noopener noreferrer"
                title="KML Specification"
              >
                KML
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Well-known_text"
                target="_blank"
                rel="noopener noreferrer"
                title="WKT"
              >
                WKT
              </a>
            </li>
          </ul>
        </ImportInfo>
      </ImportContent>
      <FooterRow>
        <Button
          style={
            isDataSet()
              ? { backgroundColor: parseResult.valid ? 'rgb(0, 105, 217)' : 'rgb(220, 53, 69)' }
              : { backgroundColor: 'rgb(206, 212, 218)' }
          }
          disabled={!isDataSet() || !parseResult.valid}
          onClick={() => {
            if (parseResult.valid) {
              props.onImport({
                type: 'FeatureCollection',
                properties: {},
                features: parseResult.features
              });
            }
            flush();
          }}
        >
          {isDataSet() && !parseResult.valid ? 'Invalid Geometry' : 'Import Geometry'}
        </Button>
        <Button onClick={flush}>Cancel</Button>
      </FooterRow>
    </ImportComponentContent>
  );
}