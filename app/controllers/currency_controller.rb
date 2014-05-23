class CurrencyController < ApplicationController
  def update
    object_hash = Hash.from_xml(open('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml').read)

    currencyArray = object_hash['Envelope']['Cube']['Cube']['Cube']

    existingCurrencyArray = []
    Currency.select(:curr_deviseSigle).each {
        |p| existingCurrencyArray.push(p.curr_deviseSigle)
    }


    currencyArray.each {
        |uneDevise|
      if existingCurrencyArray.include? uneDevise['currency']
        Currency.where('curr_deviseSigle =  ?', uneDevise['currency']).update_all(curr_tauxEuro: uneDevise['rate'])
      end
    }

    render :text => '1'
  end
end
