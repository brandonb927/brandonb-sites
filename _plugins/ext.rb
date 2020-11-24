module Jekyll
  class RenderVideoElement < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup
    end

    def render(context)
      site = context.registers[:site]
      page = context.environments.first['page']

      @base_url = site.config['baseurl']
      @site_url = site.config['url']
      @media_root = "#{site.config['assets_media']}/#{page['layout']}s"

      @attributes = {}

      @markup.scan(Liquid::TagAttributes) do |key, value|
        @attributes[key] = value.gsub(/^'|"/, '').gsub(/'|"$/, '')
      end

      @attr_src = @attributes['src']
      @attr_height = @attributes['height'] ? @attributes['height'] : 320

      # Replace the images with the proper urls
      @src_path = "#{@media_root}/#{@attr_src}"

      """
      <video width=\"100%\" height=\"#{@attr_height}\" controls>
        <source src=\"#{@src_path}\" type=\"video/mp4\"/>
        <p>Hmm, your browser doesn't seem to support HTML5 video. <a href=\"#{@src_path}\">You can download this video instead</a>.</p>
      </video>
      """.strip
    end
  end

  module Last90DaysFilter
    def last_90_days_filter(posts)
      now = DateTime.now
      today = DateTime.new(now.year, now.month, now.day, 0, 0, 0, now.zone)
      target = today - 90

      posts.select do |post|
        postedOn = post.data['date'].to_datetime

        if postedOn < today && postedOn > target
          post
        end
      end
    end
  end
end

Liquid::Template.register_tag('video', Jekyll::RenderVideoElement)
Liquid::Template.register_filter(Jekyll::Last90DaysFilter)

