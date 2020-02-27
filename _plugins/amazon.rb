module Jekyll
  class Amazon < Liquid::Tag
    include Jekyll::Filters::URLFilters

    class << self
      def tag_name
        name.split("::").last.downcase
      end
    end

    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      product_id, description = parse_parameters(context)

      site = context.registers[:site]

      base_url = 'https://amazon.ca/dp'
      amazon_associates_tag = site.config['amazon_associates_tag']

      if !description
        return "#{base_url}/#{product_id}?tag=#{amazon_associates_tag}"
      end

      return "<a href=\"#{base_url}/#{product_id}?tag=#{amazon_associates_tag}\" target=\"_blank\">#{description}</a>"
    end

    def parse_parameters(context)
      parameters = Liquid::Template.parse(@markup).render context
      parameters.strip!

      first_quote_index, last_quote_index = parameters.enum_for(:scan, /\'|\"/).map { Regexp.last_match.begin(0) }
      if first_quote_index or last_quote_index
        # product id possibly followed by quoted description
        product_id = parameters[0...first_quote_index].strip
        description = parameters[(first_quote_index+1)...last_quote_index].strip
        return product_id, description
      end

      return parameters.split(/\s+/)
    end
  end
end

Liquid::Template.register_tag(Jekyll::Amazon.tag_name, Jekyll::Amazon)
