module.exports = {
  pdfjs: { GlobalWorkerOptions: { workerSrc: "abc" } },
  Document: ({ onLoadSuccess = (pdf = { numPages: 4 }) => pdf.numPages }) => {
    return <div>{onLoadSuccess({ numPages: 4 })}</div>;
  },
  Outline: null,
  Page: () => <div>def</div>,
}
