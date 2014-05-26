require 'open-uri'

class WatcherController < ApplicationController
  def index
    @watcherLinks = Watcher.all
  end

  def add
    lien = params['lien']

    unWatcher = Watcher.create(
        :wat_dateAjout => DateTime.now.to_date,
        :wat_libelle => params['libelle'],
        :wat_lien => lien,
        :wat_qualite => params['qualite'])


    if unWatcher.save
      render :text => unWatcher.id
    end
  end

  def update
    if Watcher.update(params['id'], :wat_libelle => params['libelle'], :wat_qualite => params['qualite'],
                      :wat_lien => params['lien'])
      render :text => '1'
    end
  end

  def delete
    if Watcher.destroy(params['id'])
      render :text => '1'
    end
  end

  def recherche
    currencyArray = {}

    Currency.all.each { |uneDevise|
      currencyArray[uneDevise.curr_idSteam] = uneDevise.curr_tauxEuro
    }


    listItemsFound = []
    listFailConversionItem = []
    listFailReachUrl = []

    params['itemsId'].each {
        |unIdItem|

      begin

        watcherConcerne = Watcher.find(unIdItem)

        file = open(watcherConcerne.wat_lien)
        contents = file.read

        hash = JSON.parse contents


        listItemsForOneId = []
        listFailConversionForItem = []

        @prixSave = nil

        hash['listinginfo'].each {
            |index, unItem|

          if currencyArray.key? unItem['currencyid'].to_i
            prixItem = (((unItem['price'] + unItem['fee']).to_f / 100) / currencyArray[unItem['currencyid'].to_i])
            .round(2)

            if prixItem != 0
              if @prixSave != nil
                prixRentable = ((prixItem * 100 / 117) - (prixItem * 4 / 100)).round(2)

                if @prixSave < prixRentable
                  #on achete car rentable
                  listItemsForOneId << @prixSave
                else
                  break
                end
              end

              @prixSave = prixItem
            end

          else
            listFailConversionForItem << ['item' => watcherConcerne.wat_libelle, 'currencyid' => unItem['currencyid']]
          end
        }

        if listItemsForOneId.any?
          tempList = watcherConcerne.attributes
          tempList['itemTrouves'] = listItemsForOneId
          listItemsFound.push(tempList)
        end

        if listFailConversionForItem.any?
          listFailConversionItem.push(watcherConcerne.id => listFailConversionForItem)
        end

      rescue
        listFailReachUrl.push(watcherConcerne.id => watcherConcerne.wat_libelle)
      end
    }

    arrayResultToSend = {:success => true}

    if listItemsFound.any?
      arrayResultToSend['listItems'] = listItemsFound
    end

    if listFailConversionItem.any?
      arrayResultToSend['failConversion'] = listFailConversionItem
    end

    if listFailReachUrl.any?
      arrayResultToSend['failReach'] = listFailReachUrl
    end

    render :json => arrayResultToSend
  end
end
