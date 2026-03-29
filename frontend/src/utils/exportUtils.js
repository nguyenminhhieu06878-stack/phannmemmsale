// Simple export functions without heavy libraries for now
export const exportQuotationToPDF = (quotation) => {
  // For now, just show alert - will implement PDF later
  alert(`Export PDF for quotation ${quotation.quotationNumber}\nFeature under development...`);
};

export const exportQuotationToExcel = (quotation) => {
  // For now, just show alert - will implement Excel later  
  alert(`Export Excel for quotation ${quotation.quotationNumber}\nFeature under development...`);
};

export const exportQuotationsToExcel = (quotations) => {
  // For now, just show alert - will implement Excel later
  alert(`Export list of ${quotations.length} quotations\nFeature under development...`);
};