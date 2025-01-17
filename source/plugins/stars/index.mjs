//Setup
  export default async function ({login, graphql, q, queries, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.stars))
            return null
          if (account === "organization")
            throw {error:{message:"Not available for organizations"}}
        //Parameters override
          let {"stars.limit":limit = 4} = q
          //Limit
            limit = Math.max(1, Math.min(100, Number(limit)))
        //Retrieve user stars from graphql api
          console.debug(`metrics/compute/${login}/plugins > stars > querying api`)
          const {user:{starredRepositories:{edges:repositories}}} = await graphql(queries.starred({login, limit}))
        //Format starred repositories
          for (const edge of repositories) {
            //Format date
              const time = (Date.now()-new Date(edge.starredAt).getTime())/(24*60*60*1000)
              let updated = new Date(edge.starredAt).toDateString().substring(4)
              if (time < 1)
                updated = `${Math.ceil(time*24)} hour${Math.ceil(time*24) >= 2 ? "s" : ""} ago`
              else if (time < 30)
                updated = `${Math.floor(time)} day${time >= 2 ? "s" : ""} ago`
              edge.starred = updated
          }
        //Results
          return {repositories}
      }
    //Handle errors
      catch (error) {
        if (error.error?.message)
          throw error
        throw {error:{message:"An error occured", instance:error}}
      }
  }
